import { useEffect, useState, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("todos"); 
  const [loadingId, setLoadingId] = useState(null);

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
  const [timeFilter, setTimeFilter] = useState("all"); 
  const [timelineData, setTimelineData] = useState([]);

  // --- Função fetchStats com useCallback ---
  const fetchStats = useCallback(async () => {
    setLoading(true);
    const { data: allCases, error } = await supabase.from("missing_people").select("*");
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

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

    const genderMale = filteredCases.filter(c => c.genero === "Masculino").length;
    const genderFemale = filteredCases.filter(c => c.genero === "Feminino").length;
    const genderOther = filteredCases.filter(c => c.genero && c.genero !== "Masculino" && c.genero !== "Feminino").length;

    const age0_12 = filteredCases.filter(c => c.idade >= 0 && c.idade <= 12).length;
    const age13_18 = filteredCases.filter(c => c.idade >= 13 && c.idade <= 18).length;
    const age19_30 = filteredCases.filter(c => c.idade >= 19 && c.idade <= 30).length;
    const age31_50 = filteredCases.filter(c => c.idade >= 31 && c.idade <= 50).length;
    const age50plus = filteredCases.filter(c => c.idade > 50).length;

    const locationCounts = {};
    filteredCases.forEach(c => {
      const loc = c.ultima_localizacao || "Desconhecida";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const locationData = Object.keys(locationCounts).map(loc => ({ location: loc, count: locationCounts[loc] }));

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
  }, [timeFilter]);

  // --- Hook para verificar admin ---
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

  // --- Hook para estatísticas ---
  useEffect(() => {
    if (activeTab === "estatisticas") fetchStats();
  }, [activeTab, fetchStats]);

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

  // Funções approveCase, rejectCase, deleteCase, updateStatus seguem iguais
  // ...

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
      {/* Conteúdo permanece igual */}
    </div>
  );
}
