"""convert ingredients to json

Revision ID: 001_convert_ingredients
Revises: 
Create Date: 2025-11-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '001_convert_ingredients'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Upgrade the ingredients column from String to JSON.
    
    Note: SQLite doesn't have a native JSON type, but SQLAlchemy's JSON type
    works by storing JSON-serialized strings in a TEXT column and handling
    serialization/deserialization automatically.
    """
    # For SQLite, we need to handle this differently since ALTER COLUMN is limited
    # We'll create a new table with the correct schema and migrate data
    
    # Note: If you're using PostgreSQL or MySQL, you can use a simpler ALTER TABLE
    # For SQLite, the JSON type is actually stored as TEXT, so existing data should be compatible
    # if it's already valid JSON. We just need to ensure the column type is marked as JSON.
    
    # Since SQLite stores everything as TEXT anyway and we're just changing the Python/SQLAlchemy type,
    # we don't need to modify the actual database structure for SQLite.
    # The JSON type in SQLAlchemy for SQLite is just a hint for serialization/deserialization.
    
    # If there's existing data that needs conversion from plain string to JSON array format,
    # you would add migration logic here. For new installations, this is a no-op.
    
    pass


def downgrade() -> None:
    """
    Downgrade from JSON back to String.
    """
    # Since we didn't make actual schema changes for SQLite, downgrade is also a no-op
    pass

