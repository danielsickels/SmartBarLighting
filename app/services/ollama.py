import asyncio
import logging
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from ollama import AsyncClient
from pydantic import BaseModel
from app.core.settings import settings

logger = logging.getLogger(__name__)


class BottleImportData(BaseModel):
    """Data extracted from bottle image analysis"""
    name: str
    brand: str
    flavor_profile: str
    capacity_ml: int
    spirit_type: str


@dataclass
class BottleAnalysisResult:
    """Result of bottle image analysis including LLM response details"""
    success: bool
    data: Optional[BottleImportData] = None
    llm_response: Optional[str] = None
    error: Optional[str] = None


# Tool definition for bottle import
IMPORT_BOTTLE_TOOL = {
    "type": "function",
    "function": {
        "name": "import_bottle",
        "description": "Import a bottle into the database with extracted information from the image",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Full product name as shown on the bottle label"
                },
                "brand": {
                    "type": "string",
                    "description": "Manufacturer or brand name"
                },
                "flavor_profile": {
                    "type": "string",
                    "description": "Flavor notes and characteristics (Be direct, attempt to research the bottle, and do not state anything except flavor notes like e.g. 'smooth, vanilla, oak' or 'citrus, herbal, bitter')"
                },
                "capacity_ml": {
                    "type": "integer",
                    "description": "Bottle size in milliliters (e.g. 750, 1000, 375)"
                },
                "spirit_type": {
                    "type": "string",
                    "enum": ["Vodka", "Whiskey", "Rum", "Gin", "Tequila", "Brandy", "Liqueur", "Wine", "Beer", "Other"],
                    "description": "Type/category of spirit"
                }
            },
            "required": ["name", "brand", "flavor_profile", "capacity_ml", "spirit_type"]
        }
    }
}


class OllamaService:
    """Service for interacting with Ollama API for bottle image analysis"""
    
    def __init__(self, model_name: str = None):
        """
        Initialize the Ollama service
        
        Args:
            model_name: Name of the model to use (defaults to settings.OLLAMA_MODEL)
        """
        self.model_name = model_name or settings.OLLAMA_MODEL
        self.client = AsyncClient(host=settings.OLLAMA_HOST)
        logger.info(f"Initialized Ollama service with model: {self.model_name}, host: {settings.OLLAMA_HOST}")
    
    def check_tool_calls(self, response) -> bool:
        """Check if the response contains tool calls"""
        return hasattr(response, 'message') and response.message.tool_calls
    
    def check_message(self, response) -> bool:
        """Check if the response contains a message"""
        return hasattr(response, 'message')
    
    def get_message_content(self, response) -> Optional[str]:
        """Extract text content from response message"""
        if hasattr(response, 'message') and hasattr(response.message, 'content'):
            return response.message.content
        return None
    
    async def call_with_retries(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        check_func: Callable,
        options: Dict[str, Any] = None,
        retries: int = 3
    ):
        """
        Call Ollama API with retries
        
        Args:
            messages: List of messages for the conversation
            tools: List of tools available to the model
            check_func: Function to check if the response is valid
            options: Options for the Ollama API
            retries: Number of retries
            
        Returns:
            Tuple of (response, last_response) - response is valid response or None,
            last_response is the last response received (for error reporting)
        """
        options = options or {"num_predict": 500, "temperature": 0.3}
        last_response = None
        last_error = None
        
        for attempt in range(1, retries + 1):
            try:
                response = await self.client.chat(
                    model=self.model_name,
                    messages=messages,
                    tools=tools,
                    stream=False,
                    options=options
                )
                last_response = response
                
                if check_func(response):
                    return response, last_response
                else:
                    logger.warning(f"Attempt {attempt}/{retries}: Check failed - no tool calls in response")
                    # Get LLM's response text for debugging
                    content = self.get_message_content(response)
                    if content:
                        logger.info(f"LLM response: {content}")
            except Exception as e:
                last_error = str(e)
                logger.error(f"Attempt {attempt}/{retries}: Error calling Ollama: {e}")
            
            if attempt < retries:
                await asyncio.sleep(1)  # Delay between retries
        
        logger.error("All retries failed")
        return None, last_response
    
    async def analyze_bottle_image(self, image_base64: str) -> BottleAnalysisResult:
        """
        Analyze a bottle image using Ollama's vision model with tool calling.
        
        Args:
            image_base64: Base64 encoded image data
            
        Returns:
            BottleAnalysisResult with extracted data and/or error information
        """
        messages = [
            {
                "role": "user",
                "content": "Deeply analyze this bottle image and extract the bottle information to import it into a database. Use the import_bottle tool to submit the extracted data.",
                "images": [image_base64]
            }
        ]
        
        tools = [IMPORT_BOTTLE_TOOL]
        
        try:
            response, last_response = await self.call_with_retries(
                messages=messages,
                tools=tools,
                check_func=self.check_tool_calls,
                options={"num_predict": 500, "temperature": 0.2},
                retries=3
            )
            
            # Get LLM's text response if any
            llm_text = self.get_message_content(last_response) if last_response else None
            
            if not response:
                # Tool call failed - return the LLM's response for context
                return BottleAnalysisResult(
                    success=False,
                    llm_response=llm_text,
                    error="The AI did not use the import tool. It may not have recognized a bottle in the image."
                )
            
            # Extract tool call arguments
            tool_call = response.message.tool_calls[0]
            arguments = tool_call.function.arguments
            
            logger.info(f"Bottle analysis result: {arguments}")
            
            bottle_data = BottleImportData(**arguments)
            
            return BottleAnalysisResult(
                success=True,
                data=bottle_data,
                llm_response=llm_text
            )
            
        except Exception as e:
            logger.error(f"Error analyzing bottle image: {e}")
            return BottleAnalysisResult(
                success=False,
                error=str(e)
            )


# Create singleton instance
ollama_service = OllamaService()
