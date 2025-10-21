import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import StatusBadge from "../components/StatusBadge.js";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("todos"); // todos, pendentes, aprovados, rejeitados
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return window.location.href = "/login";

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || profile.role !== "admin") return window.location.href = "/not-authorized";

      setSession(session);
      fetchCases();
    };

    checkAdmin();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("missing_people")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setCases(data);

    setLoading(false);
  };

  const approveCase = async (id) => {
    setLoadingId(id);
    const { error } = await supabase
      .from("missing_people")
      .update({ approved: true, rejected: false, approved_by: session.user.id, approved_at: new Date() })
      .eq("id", id);
    setLoadingId(null);
    if (error) console.error(error);
    else fetchCases();
  };

  const rejectCase = async (id) => {
    const motivo = window.prompt("Motivo da rejeição:");
    if (motivo === null) return;

    setLoadingId(id);
    const { error } = await supabase
      .from("missing_people")
      .update({ rejected: true, approved: false, encerrado_motivo: motivo })
      .eq("id", id);
    setLoadingId(null);
    if (error) console.error(error);
    else fetchCases();
  };

  const deleteCase = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja apagar este caso?");
    if (!confirmDelete) return;

    setLoadingId(id);
    const { error } = await supabase
      .from("missing_people")
      .delete()
      .eq("id", id);
    setLoadingId(null);
    if (error) console.error(error);
    else fetchCases();
  };

  const updateStatus = async (id, status) => {
    let motivo = null;
    if (status === "Encerrada") {
      motivo = window.prompt("Motivo do encerramento:");
      if (motivo === null) return;
    }

    setLoadingId(id);
    const { error } = await supabase
      .from("missing_people")
      .update({ status, encerrado_motivo: motivo })
      .eq("id", id);
    setLoadingId(null);
    if (error) console.error(error);
    else fetchCases();
  };

  if (loading) return <p className="p-10">Carregando...</p>;

  const filteredCases = cases.filter((c) => {
    if (activeTab === "pendentes") return !c.approved && !c.rejected;
    if (activeTab === "aprovados") return c.approved;
    if (activeTab === "rejeitados") return c.rejected;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-pink-700">Admin Menu</h2>
        <nav className="flex flex-col space-y-3">
          <button
            className={`text-left px-3 py-2 rounded transition-colors duration-200 ${activeTab === "todos" ? "bg-pink-600 text-white" : "hover:bg-gray-200"}`}
            onClick={() => setActiveTab("todos")}
          >
            Todos os casos
          </button>
          <button
            className={`text-left px-3 py-2 rounded transition-colors duration-200 ${activeTab === "pendentes" ? "bg-pink-600 text-white" : "hover:bg-gray-200"}`}
            onClick={() => setActiveTab("pendentes")}
          >
            Pendentes
          </button>
          <button
            className={`text-left px-3 py-2 rounded transition-colors duration-200 ${activeTab === "aprovados" ? "bg-pink-600 text-white" : "hover:bg-gray-200"}`}
            onClick={() => setActiveTab("aprovados")}
          >
            Aprovados
          </button>
          <button
            className={`text-left px-3 py-2 rounded transition-colors duration-200 ${activeTab === "rejeitados" ? "bg-pink-600 text-white" : "hover:bg-gray-200"}`}
            onClick={() => setActiveTab("rejeitados")}
          >
            Rejeitados
          </button>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-pink-700">Dashboard Vuyakaya</h1>

        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-pink-600 text-white">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th>Idade</th>
              <th>Gênero</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Aprovado</th>
              <th>Foto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.nome}</td>
                <td className="text-center">{c.idade}</td>
                <td className="text-center">{c.genero}</td>
                <td className="text-center">{c.ultima_localizacao}</td>
                <td className="text-center"><StatusBadge status={c.status} /></td>
                <td className="text-center">{c.approved ? "✅" : c.rejected ? "❌ Rejeitado" : "❌"}</td>
                <td className="text-center">
                  {c.photo_url ? <img src={c.photo_url} alt={c.nome} className="w-16 h-16 object-cover rounded p-2" /> : "-"}
                </td>
                <td className="text-center space-x-2">
                  {!c.approved && !c.rejected && (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200"
                        onClick={() => approveCase(c.id)}
                        disabled={loadingId === c.id}
                      >
                        {loadingId === c.id ? "Carregando..." : "Aprovar"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
                        onClick={() => rejectCase(c.id)}
                        disabled={loadingId === c.id}
                      >
                        {loadingId === c.id ? "Rejeitando..." : "Rejeitar"}
                      </button>
                    </>
                  )}
                  {c.approved && (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200"
                        onClick={() => updateStatus(c.id, "Encontrada")}
                        disabled={loadingId === c.id}
                      >
                        {loadingId === c.id ? "Atualizando..." : "Encontrada"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
                        onClick={() => updateStatus(c.id, "Encerrada")}
                        disabled={loadingId === c.id}
                      >
                        {loadingId === c.id ? "Atualizando..." : "Encerrar"}
                      </button>
                    </>
                  )}
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors duration-200"
                    onClick={() => deleteCase(c.id)}
                    disabled={loadingId === c.id}
                  >
                    {loadingId === c.id ? "Apagando..." : "Apagar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
