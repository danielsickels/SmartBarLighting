interface BottleDetailsProps {
  id: number;
  name: string;
  material: string;
  capacity_ml: number;
}

const BottleDetails = ({ id, name, material, capacity_ml }: BottleDetailsProps) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <p><strong>ID:</strong> {id}</p> {/* Display the ID */}
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Material:</strong> {material}</p>
      <p><strong>Capacity:</strong> {capacity_ml} ml</p>
    </div>
  );
};

export default BottleDetails;
