// Feed.js
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { IoShareOutline, IoSearch, IoCloseCircle } from "react-icons/io5";
import BottomNav from "../components/BottomNav";

export default function Feed() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [statuses] = useState(["Todos", "Ativo", "Encontrada", "Encerrada"]);
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const mainColor = "#d91c5c";
  const lightMainColor = "#f2c1c9";
  const darkMainColor = "#2b3990";

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("missing_people")
          .select("*")
          .eq("approved", true)
          .eq("rejected", false)
          .order("created_at", { ascending: false });

        if (error) console.error("Erro ao buscar pessoas:", error);
        else if (data) {
          setPeople(data);

          // Extrair categorias únicas
          const uniqueCategories = Array.from(
            new Set(data.map((p) => p.category).filter((c) => c))
          );
          setCategories(["Todos", ...uniqueCategories]);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();

    const channel = supabase
      .channel("missing_people_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "missing_people" },
        async (payload) => {
          const newData = payload.new;
          if (newData?.approved && !newData?.rejected) {
            await fetchPeople();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleShare = async (person) => {
    const shareData = {
      title: "Pessoa Desaparecida",
      text: `🚨 Pessoa Desaparecida 🚨
Nome: ${person.nome}
Idade: ${person.idade}
Última localização: ${person.ultima_localizacao}
Contacto: ${person.contacto_do_responsavel}
Descrição: ${person.descricao_detalhada}
Status: ${person.status || "Ativo"}`,
      url: person.photo_url || undefined,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else alert("Compartilhamento não suportado neste browser.");
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  const filteredPeople = people.filter((p) => {
    const status = p.status?.trim() || "Ativo";
    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.nome?.toLowerCase().includes(searchLower) ||
      p.ultima_localizacao?.toLowerCase().includes(searchLower) ||
      p.idade?.toString().includes(searchLower);
    const matchesCategory =
      !selectedCategory || selectedCategory === "Todos" ? true : p.category === selectedCategory;
    const matchesStatus =
      !selectedStatus || selectedStatus === "Todos"
        ? true
        : selectedStatus === "Ativo"
        ? status === "Ativo"
        : status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = status || "Ativo";
    if (s === "Ativo") return "#4CAF50";
    if (s === "Encerrada") return "#F44336";
    if (s === "Encontrada") return "#2196F3";
    return "#FF9800";
  };

  const renderPerson = (person) => {
    const status = person.status?.trim() || "Ativo";
    return (
      <div
        key={person.id}
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 12,
          margin: "6px 12px",
          position: "relative",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {status && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: getStatusColor(status),
              padding: "2px 8px",
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {status}
          </div>
        )}

       <a href={`/feed/${person.id}/detalhes`}>
         <img
          src={person.photo_url || "/images/render.jpg"}
          alt={person.nome}
          style={{ width: 80, height: 80, borderRadius: 8 }}
        />

       </a>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>{person.nome}</div>
          <div style={{ color: mainColor }}>Última localização:</div>
          <div style={{ color: darkMainColor }}>{person.ultima_localizacao}</div>
          <div style={{ color: mainColor }}>Idade: {person.idade}</div>
        </div>

        <button
          onClick={() => handleShare(person)}
          style={{
            backgroundColor: lightMainColor,
            borderRadius: 4,
            border: `1px solid ${mainColor}`,
            padding: 4,
            marginLeft: 8,
            cursor: "pointer",
          }}
        >
          <IoShareOutline size={28} color={mainColor} />
        </button>
      </div>
    );
  };

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 50 }}>
        <p style={{ color: mainColor, fontWeight: 600 }}>Carregando pessoas...</p>
      </div>
    );

  return (

    <>
    <div style={{ paddingBottom: 20 }}>
      {/* Pesquisa */}
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: "bold", color: mainColor, marginBottom: 12 }}>
          Procurar Pessoas
        </h2>
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${mainColor}`, borderRadius: 50, padding: "4px 12px", backgroundColor: "#fff" }}>
          <IoSearch size={20} color="#262525" />
          <input
            type="text"
            placeholder="Pesquisar por nome, cidade, idade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: 6, border: "none", outline: "none", color: "#262525" }}
          />
          {search.length > 0 && <IoCloseCircle size={20} color="#262525" style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
        </div>
      </div>

      {/* Filtros de categoria */}
      <div style={{ display: "flex", overflowX: "auto", padding: "0 16px", marginBottom: 8 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? "Todos" : cat)}
            style={{
              borderRadius: 50,
              padding: "6px 16px",
              marginRight: 8,
              backgroundColor: selectedCategory === cat ? mainColor : lightMainColor,
              color: selectedCategory === cat ? "#fff" : "#d91c5c",
              border: `1px solid ${mainColor}`,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros de status */}
      <div style={{ display: "flex", overflowX: "auto", padding: "0 16px", marginBottom: 12 }}>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(selectedStatus === st ? "Todos" : st)}
            style={{
              borderRadius: 50,
              padding: "6px 16px",
              marginRight: 8,
              backgroundColor: selectedStatus === st ? mainColor : lightMainColor,
              color: selectedStatus === st ? "#fff" : "#d91c5c",
              border: `1px solid ${mainColor}`,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Lista de pessoas */}
      {filteredPeople.length > 0 ? (
        filteredPeople.map(renderPerson)
      ) : (
        <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>Nenhuma publicação aprovada encontrada.</p>
      )}
    </div>

    <BottomNav/>

    </>
  );
}
