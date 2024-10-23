interface BottleProps {
    name: string;
    material: string;
    capacity_ml: number;
  }
  
  const BottleDetails: React.FC<BottleProps> = ({ name, material, capacity_ml }) => {
    return (
      <div className="border p-6 rounded-lg shadow-md bg-white max-w-md mx-auto">
        <p className="text-lg"><strong>Name:</strong> {name}</p>
        <p className="text-lg"><strong>Material:</strong> {material}</p>
        <p className="text-lg"><strong>Capacity:</strong> {capacity_ml} ml</p>
      </div>
    );
  };
  
  export default BottleDetails;
  