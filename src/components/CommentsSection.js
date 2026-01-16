import { supabase } from "../utils/supabase";
import React, { useEffect, useState } from "react";
import { IoSendOutline, IoArrowRedoOutline } from "react-icons/io5";

export default function CommentsSection({ missingPersonId }) {
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Carrega usuário e comentários
  useEffect(() => {
    const loadUserAndComments = async () => {
      setLoading(true);
      console.log("🚀 Carregando usuário e comentários...");

      // Obter usuário autenticado
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) console.error("Erro auth:", authError);
      const authUser = authData?.user;
      console.log("👤 Usuário logado:", authUser);

      if (authUser) {
        setUser(authUser);

        // Buscar perfil do usuário logado
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("id", authUser.id)
          .single();

        if (profileError) console.error("Erro ao buscar perfil:", profileError);
        console.log("📦 Perfil do usuário:", profile);
        setUserProfile(profile);
      }

      // Buscar todos os comentários
      const { data: commentsData, error: commentsError } = await supabase
        .from("status_comments")
        .select("*")
        .eq("missing_person_id", missingPersonId)
        .order("created_at", { ascending: true });

      if (commentsError) console.error("Erro ao buscar comentários:", commentsError);
      console.log("💬 Comentários brutos:", commentsData);

      // Buscar perfis correspondentes a cada comentário
      const uniqueUserIds = [
        ...new Set((commentsData || []).map((c) => c.user_id)),
      ];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", uniqueUserIds);

      if (profilesError) console.error("Erro ao buscar perfis:", profilesError);
      console.log("🧩 Perfis:", profilesData);

      // Combinar comentários com perfis
      const commentsWithAvatars = (commentsData || []).map((c) => {
        const profile = profilesData?.find((p) => p.id === c.user_id);
        return {
          ...c,
          user_name: c.user_name || profile?.name || "Usuário",
          avatar_url: profile?.avatar_url || "/images/default-avatar.png",
        };
      });

      setComments(commentsWithAvatars);
      setLoading(false);
    };

    loadUserAndComments();
  }, [missingPersonId]);

  // 🔹 Adicionar comentário principal
  const addComment = async () => {
    if (!user) return alert("Você precisa estar logado para comentar.");
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from("status_comments")
      .insert([
        {
          missing_person_id: missingPersonId,
          user_id: user.id,
          user_name: userProfile?.name || "Sem nome",
          avatar_url: userProfile?.avatar_url || null,
          comment: newComment.trim(),
          parent_id: null,
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao adicionar comentário:", error);
      return;
    }

    console.log("✅ Comentário adicionado:", data[0]);
    setComments([...comments, data[0]]);
    setNewComment("");
  };

  // 🔹 Adicionar resposta
  const addReply = async (parentId) => {
    if (!user || !replyText[parentId]?.trim()) return;

    const { data, error } = await supabase
      .from("status_comments")
      .insert([
        {
          missing_person_id: missingPersonId,
          user_id: user.id,
          user_name: userProfile?.name || "Sem nome",
          avatar_url: userProfile?.avatar_url || null,
          comment: replyText[parentId].trim(),
          parent_id: parentId,
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao adicionar resposta:", error);
      return;
    }

    console.log("↩️ Resposta adicionada:", data[0]);
    setComments([...comments, data[0]]);
    setReplyText({ ...replyText, [parentId]: "" });
  };

  // 🔹 Renderizar comentários
  const renderComments = () => {
    const mainComments = comments.filter((c) => c.parent_id === null);
    const replies = comments.filter((c) => c.parent_id !== null);

    return mainComments.map((c) => (
      <div key={c.id} style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            backgroundColor: "#f5f5f5",
            padding: 12,
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <img
            src={c.avatar_url || "/images/default-avatar.png"}
            alt={c.user_name}
            onError={(e) => (e.target.src = "/images/default-avatar.png")}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", marginBottom: 4, color: "#222" }}>
              {c.user_name}
            </strong>
            <p style={{ margin: 0, color: "#333", lineHeight: 1.4 }}>
              {c.comment}
            </p>
          </div>
        </div>

        {/* 🔹 Respostas */}
        <div style={{ marginLeft: 56, marginTop: 8 }}>
          {replies
            .filter((r) => r.parent_id === c.id)
            .map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  backgroundColor: "#fff",
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 6,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={r.avatar_url || "https://picsum.photos/200"}
                  alt={r.user_name}
                  onError={(e) => (e.target.src = "https://picsum.photos/200")}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <strong
                    style={{ display: "block", marginBottom: 2, color: "#222" }}
                  >
                    {r.user_name}
                  </strong>
                  <p style={{ margin: 0, color: "#555", lineHeight: 1.3 }}>
                    {r.comment}
                  </p>
                </div>
              </div>
            ))}

          {/* 🔹 Campo para resposta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
            }}
          >
            <input
              type="text"
              placeholder="Responder..."
              value={replyText[c.id] || ""}
              onChange={(e) =>
                setReplyText({ ...replyText, [c.id]: e.target.value })
              }
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                border: "1px solid #ccc",
                backgroundColor: "#fafafa",
              }}
            />
            <button
              onClick={() => addReply(c.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                backgroundColor: "#2b3990",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <IoArrowRedoOutline size={18} />
            </button>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) return <p>Carregando comentários...</p>;

  return (
    <div style={{ margin: "20px 0" }}>
      {renderComments()}

      {/* 🔹 Novo comentário */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}
      >
        <input
          type="text"
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 12,
            border: "1px solid #ccc",
            backgroundColor: "#fafafa",
          }}
        />
        <button
          onClick={addComment}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            backgroundColor: "#2b3990",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <IoSendOutline size={20} />
        </button>
      </div>
    </div>
  );
}
