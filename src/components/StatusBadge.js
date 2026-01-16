export default function StatusBadge({ status }) {
  let color = "bg-gray-400";
  if (status === "Encontrada") color = "bg-green-500";
  else if (status === "Desaparecida") color = "bg-red-500";
  else if (status === "Encerrada") color = "bg-yellow-500";

  return <span className={`text-white px-2 py-1 rounded` + ` ${color}`}>{status}</span>;
}
