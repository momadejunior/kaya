import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import StatusBadge from "../components/StatusBadge.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("todos"); // todos, pendentes, aprovados, rejeitados, estatisticas
  const [loadingId, setLoadingId] = useState(null);

  // --- Estatísticas ---
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    encerradas: 0,
    encontradas: 0,
    genderMale: 0,
    genderFemale: 0,
    genderOther: 0,
    age0_12: 0,
    age13_18: 0,
    age19_30: 0,
    age31_50: 0,
    age50plus: 0,
    locationData: [],
  });
  const [timeFilter, setTimeFilter] = useState("all"); // all, week, month, year
  const [timelineData, setTimelineData] = useState([]);

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

  useEffect(() => {
    if (activeTab === "estatisticas") fetchStats();
  }, [activeTab, timeFilter]);

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

  // --- Função de estatísticas ---
  const fetchStats = async () => {
    setLoading(true);
    const { data: allCases, error } = await supabase.from("missing_people").select("*");
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Filtrar por período
    const now = dayjs();
    let filteredCases = allCases;
    if (timeFilter === "week") filteredCases = allCases.filter(c => dayjs(c.created_at).isAfter(now.subtract(7, "day")));
    if (timeFilter === "month") filteredCases = allCases.filter(c => dayjs(c.created_at).isAfter(now.subtract(1, "month")));
    if (timeFilter === "year") filteredCases = allCases.filter(c => dayjs(c.created_at).isAfter(now.subtract(1, "year")));

    const approved = filteredCases.filter(c => c.approved && !c.rejected).length;
    const rejected = filteredCases.filter(c => c.rejected).length;
    const pending = filteredCases.filter(c => !c.approved && !c.rejected).length;
    const encerradas = filteredCases.filter(c => c.status === "Encerrada").length;
    const encontradas = filteredCases.filter(c => c.status === "Encontrada").length;

    // --- Estatísticas de gênero ---
    const genderMale = filteredCases.filter(c => c.genero === "Masculino").length;
    const genderFemale = filteredCases.filter(c => c.genero === "Feminino").length;
    const genderOther = filteredCases.filter(c => c.genero && c.genero !== "Masculino" && c.genero !== "Feminino").length;

    // --- Estatísticas por idade ---
    const age0_12 = filteredCases.filter(c => c.idade >= 0 && c.idade <= 12).length;
    const age13_18 = filteredCases.filter(c => c.idade >= 13 && c.idade <= 18).length;
    const age19_30 = filteredCases.filter(c => c.idade >= 19 && c.idade <= 30).length;
    const age31_50 = filteredCases.filter(c => c.idade >= 31 && c.idade <= 50).length;
    const age50plus = filteredCases.filter(c => c.idade > 50).length;

    // --- Estatísticas por localização ---
    const locationCounts = {};
    filteredCases.forEach(c => {
      const loc = c.ultima_localizacao || "Desconhecida";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const locationData = Object.keys(locationCounts).map(loc => ({ location: loc, count: locationCounts[loc] }));

    // --- Timeline ---
    const timeline = {};
    filteredCases.forEach(c => {
      const date = dayjs(c.created_at).format("YYYY-MM-DD");
      timeline[date] = (timeline[date] || 0) + 1;
    });
    const timelineArray = Object.keys(timeline).sort().map(date => ({ date, count: timeline[date] }));

    setStats({ 
      total: filteredCases.length,
      approved,
      rejected,
      pending,
      encerradas,
      encontradas,
      genderMale,
      genderFemale,
      genderOther,
      age0_12,
      age13_18,
      age19_30,
      age31_50,
      age50plus,
      locationData
    });

    setTimelineData(timelineArray);
    setLoading(false);
  };

  if (loading) return <p className="p-10">Carregando...</p>;

  const filteredCases = cases.filter(c => {
    if (activeTab === "pendentes") return !c.approved && !c.rejected;
    if (activeTab === "aprovados") return c.approved;
    if (activeTab === "rejeitados") return c.rejected;
    return true;
  });

  const COLORS = ["#22c55e", "#ef4444", "#facc15", "#3b82f6", "#a855f7"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-pink-700">Admin Menu</h2>
        <nav className="flex flex-col space-y-3">
          {["todos", "pendentes", "aprovados", "rejeitados", "estatisticas"].map(tab => (
            <button
              key={tab}
              className={`text-left px-3 py-2 rounded transition-colors duration-200 ${
                activeTab === tab ? "bg-pink-600 text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "todos" ? "Todos" : tab === "pendentes" ? "Pendentes" : tab === "aprovados" ? "Aprovados" : tab === "rejeitados" ? "Rejeitados" : "Estatísticas"}
            </button>
          ))}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        {activeTab === "estatisticas" ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-pink-700">Estatísticas</h1>

            {/* Filtros */}
            <div className="mb-6 flex space-x-3">
              {["all", "week", "month", "year"].map(filter => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded ${
                    timeFilter === filter ? "bg-pink-600 text-white" : "bg-white shadow hover:bg-gray-100"
                  }`}
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter === "all" ? "Todos" : filter === "week" ? "Última semana" : filter === "month" ? "Último mês" : "Último ano"}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <h2 className="text-2xl font-bold text-pink-700">{stats.total}</h2>
                <p>Total de casos</p>
              </div>
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <h2 className="text-2xl font-bold text-green-600">{stats.approved}</h2>
                <p>Aprovados</p>
              </div>
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <h2 className="text-2xl font-bold text-red-600">{stats.rejected}</h2>
                <p>Rejeitados</p>
              </div>
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <h2 className="text-2xl font-bold text-yellow-500">{stats.pending}</h2>
                <p>Pendentes</p>
              </div>
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <h2 className="text-2xl font-bold text-blue-600">{stats.encerradas}</h2>
                <p>Encerrados</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Distribuição geral */}
              <div className="bg-white shadow rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-4 text-center text-pink-700">Distribuição dos Casos</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Aprovados", value: stats.approved },
                        { name: "Rejeitados", value: stats.rejected },
                        { name: "Pendentes", value: stats.pending },
                        { name: "Encerrados", value: stats.encerradas },
                        { name: "Encontrados", value: stats.encontradas },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[
                        stats.approved,
                        stats.rejected,
                        stats.pending,
                        stats.encerradas,
                        stats.encontradas,
                      ].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Evolução temporal */}
              <div className="bg-white shadow rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-4 text-center text-pink-700">Evolução Temporal dos Casos</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gênero, idade e localização */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Gênero */}
              <div className="bg-white shadow rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-4 text-center text-pink-700">Distribuição por Gênero</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Masculino", value: stats.genderMale },
                        { name: "Feminino", value: stats.genderFemale },
                        { name: "Outro", value: stats.genderOther },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {["#3b82f6", "#ec4899", "#fcd34d"].map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Idade */}
              <div className="bg-white shadow rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-4 text-center text-pink-700">Distribuição por Idade</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "0-12", value: stats.age0_12 },
                        { name: "13-18", value: stats.age13_18 },
                        { name: "19-30", value: stats.age19_30 },
                        { name: "31-50", value: stats.age31_50 },
                        { name: "50+", value: stats.age50plus },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {["#22c55e", "#facc15", "#f87171", "#6366f1", "#a855f7"].map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Localização */}
              <div className="bg-white shadow rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-4 text-center text-pink-700">Casos por Localização</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
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
                    <td className="text-center">{c.photo_url ? <img src={c.photo_url} alt={c.nome} className="w-16 h-16 object-cover rounded p-2" /> : "-"}</td>
                    <td className="text-center space-x-2">
                      {!c.approved && !c.rejected && (
                        <>
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={() => approveCase(c.id)} disabled={loadingId === c.id}>
                            {loadingId === c.id ? "Carregando..." : "Aprovar"}
                          </button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => rejectCase(c.id)} disabled={loadingId === c.id}>
                            {loadingId === c.id ? "Rejeitando..." : "Rejeitar"}
                          </button>
                        </>
                      )}
                      {c.approved && (
                        <>
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={() => updateStatus(c.id, "Encontrada")} disabled={loadingId === c.id}>
                            {loadingId === c.id ? "Atualizando..." : "Encontrada"}
                          </button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => updateStatus(c.id, "Encerrada")} disabled={loadingId === c.id}>
                            {loadingId === c.id ? "Atualizando..." : "Encerrar"}
                          </button>
                        </>
                      )}
                      <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded" onClick={() => deleteCase(c.id)} disabled={loadingId === c.id}>
                        {loadingId === c.id ? "Apagando..." : "Apagar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}