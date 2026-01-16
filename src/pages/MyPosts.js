// components/MyPosts.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { IoHeartOutline, IoHeart, IoChatbubbleOutline } from "react-icons/io5";
import SharePersonButton from "../components/ShareButton";
import CommentsSection from "../components/CommentsSection";

export default function MyPosts() {
  const [userId, setUserId] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [encerrarMotivo, setEncerrarMotivo] = useState("");
  const [encerrarStatus, setEncerrarStatus] = useState("Encontrada");

  // Obter usuário autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Buscar publicações do usuário
  const fetchMyPosts = useCallback(async () => {
    if (!userId) return;

    const { data: posts, error } = await supabase
      .from("missing_people")
      .select("*")
      .eq("reported_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar publicações:", error);
      setMyPosts([]);
      return;
    }

    const postsWithCounts = await Promise.all(
      (posts ?? []).map(async (post) => {
        const { count: likesCount } = await supabase
          .from("missing_people_likes")
          .select("*", { count: "exact", head: true })
          .eq("missing_person_id", post.id);

        const { data: userLiked } = await supabase
          .from("missing_people_likes")
          .select("*")
          .eq("missing_person_id", post.id)
          .eq("user_id", userId)
          .maybeSingle();

        const { count: commentsCount } = await supabase
          .from("status_comments")
          .select("*", { count: "exact", head: true })
          .eq("missing_person_id", post.id);

        const { count: sharesCount } = await supabase
          .from("missing_people_shares")
          .select("*", { count: "exact", head: true })
          .eq("missing_person_id", post.id);

        return {
          ...post,
          likes_count: likesCount ?? 0,
          comments_count: commentsCount ?? 0,
          shares_count: sharesCount ?? 0,
          liked_by_user: !!userLiked,
        };
      })
    );

    setMyPosts(postsWithCounts);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchMyPosts();
  }, [userId, fetchMyPosts]);

  // Like / Deslike
  const handleLike = async (post) => {
    if (!userId) return;

    if (post.liked_by_user) {
      await supabase
        .from("missing_people_likes")
        .delete()
        .eq("missing_person_id", post.id)
        .eq("user_id", userId);
    } else {
      await supabase.from("missing_people_likes").insert({
        user_id: userId,
        missing_person_id: post.id,
      });
    }

    setMyPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked_by_user: !p.liked_by_user,
              likes_count: p.liked_by_user
                ? (p.likes_count ?? 0) - 1
                : (p.likes_count ?? 0) + 1,
            }
          : p
      )
    );
  };

  // Abrir modal
  const openEncerrarModal = (postId) => {
    setSelectedPostId(postId);
    setEncerrarMotivo("");
    setEncerrarStatus("Encontrada");
    setModalVisible(true);
  };

  // Confirmar encerramento
  const handleConfirmEncerrar = async () => {
    if (!selectedPostId || !encerrarMotivo) return;

    try {
      const { error } = await supabase
        .from("missing_people")
        .update({ status: encerrarStatus, encerrado_motivo: encerrarMotivo })
        .eq("id", selectedPostId);

      if (error) throw error;

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId
            ? { ...p, status: encerrarStatus, encerrado_motivo: encerrarMotivo }
            : p
        )
      );

      setModalVisible(false);
      alert("Publicação encerrada com sucesso!");
    } catch (err) {
      console.error("Erro ao encerrar publicação:", err);
      alert("Não foi possível encerrar a publicação.");
    }
  };

  if (loading) return <div>Carregando publicações...</div>;

  return (
    <div className="p-4 mt-4">
      {myPosts.map((post) => (
        <div
          key={post.id}
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            position: "relative",
          }}
          className="m-auto md:w-1/2 sm:1/1"
        >
          {post.photo_url && (
            <img
              src={post.photo_url}
              alt={post.nome}
              style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
            />
          )}

          {post.status && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#d91c5c",
                padding: "4px 8px",
                borderRadius: 6,
                color: "#fff",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {post.status}
            </div>
          )}

          <h2 style={{ margin: 0 }}>{post.nome}</h2>
          <p style={{ color: "#d91c5c", fontWeight: "bold" }}>{post.category}</p>
          <p>Última localização: {post.ultima_localizacao}</p>
          <p>{post.descricao_detalhada}</p>
          <p style={{ color: "#999", fontSize: 12 }}>
            {new Date(post.created_at).toLocaleString()}
          </p>

          {/* Ações */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <button
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              onClick={() => handleLike(post)}
            >
              {post.liked_by_user ? <IoHeart color="#d91c5c" /> : <IoHeartOutline />}
              {post.likes_count ?? 0} Likes
            </button>

            <button style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IoChatbubbleOutline />
              {post.comments_count ?? 0} Comentários
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <SharePersonButton
                person={post}
                onShared={() =>
                  setMyPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id
                        ? { ...p, shares_count: (p.shares_count ?? 0) + 1 }
                        : p
                    )
                  )
                }
              />
              {post.shares_count ?? 0} Partilhas
            </div>
          </div>

          {post.status && (
            <div
              style={{
                marginTop: 12,
                padding: 8,
                background: "#f3f4f6",
                borderRadius: 8,
              }}
            >
              <p>
                <strong>Status:</strong> {post.status}
              </p>
              <p>
                <strong>Motivo:</strong> {post.encerrado_motivo}
              </p>
            </div>
          )}

          <button
            style={{
              marginTop: 12,
              borderRadius: 8,
              padding: "10px 0",
              width: "100%",
              background: post.status ? "#ccc" : "#d91c5c",
              color: post.status ? "#666" : "#fff",
              fontWeight: "bold",
              cursor: post.status ? "not-allowed" : "pointer",
            }}
            onClick={() => !post.status && openEncerrarModal(post.id)}
            disabled={!!post.status}
          >
            {post.status ? "Publicação encerrada" : "Encerrar publicação"}
          </button>

          <CommentsSection missingPersonId={Number(post.id)} />
        </div>
      ))}

      {/* Modal */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <h2>Encerrar publicação</h2>

            <label style={{ fontWeight: 600, display: "block", marginTop: 8 }}>
              Motivo do encerramento:
            </label>
            <input
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                marginBottom: 8,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              placeholder="Digite o motivo"
              value={encerrarMotivo}
              onChange={(e) => setEncerrarMotivo(e.target.value)}
            />

            <label style={{ fontWeight: 600, display: "block", marginTop: 8 }}>
              Status da pessoa:
            </label>
            <select
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                marginBottom: 8,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              value={encerrarStatus}
              onChange={(e) => setEncerrarStatus(e.target.value)}
            >
              <option value="Encontrada">Encontrada</option>
              <option value="Caso encerrado">Caso encerrado</option>
              <option value="Outros">Outros</option>
            </select>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button
                style={{ padding: "10px 20px", borderRadius: 8, background: "#ccc" }}
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </button>
              <button
                style={{ padding: "10px 20px", borderRadius: 8, background: "#d91c5c", color: "#fff" }}
                onClick={handleConfirmEncerrar}
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
