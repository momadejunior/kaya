import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Reportar() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    idade: "",
    genero: "",
    ultimaLocalizacao: "",
    descricaoDetalhada: "",
    contacto: "",
    categoria: "",
    foto: null,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      else setShowLoginModal(true);
    };
    getUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChooseImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nome, idade, genero, ultimaLocalizacao, descricaoDetalhada, contacto, categoria, foto } = form;

    if (!nome || !idade || !genero || !ultimaLocalizacao || !descricaoDetalhada || !contacto || !categoria) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!foto) {
      alert("Por favor, selecione uma foto.");
      return;
    }

    const idadeInt = parseInt(idade);
    if (isNaN(idadeInt)) {
      alert("Idade inválida.");
      return;
    }

    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    let photoUrl = null;
    try {
      setUploading(true);
      const ext = foto.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("missing")
        .upload(fileName, foto, { contentType: foto.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("missing").getPublicUrl(fileName);
      photoUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      alert("Erro ao enviar a imagem.");
      setUploading(false);
      return;
    }

    const { error } = await supabase.from("missing_people").insert([
      {
        nome,
        idade: idadeInt,
        genero,
        ultima_localizacao: ultimaLocalizacao,
        descricao_detalhada: descricaoDetalhada,
        contacto_do_responsavel: contacto,
        photo_url: photoUrl,
        category: categoria,
        reported_by: userId,
      },
    ]);

    setUploading(false);

    if (error) {
      console.error(error);
      alert("Não foi possível enviar a denúncia.");
      return;
    }

    alert("Denúncia enviada com sucesso!");
    setForm({
      nome: "",
      idade: "",
      genero: "",
      ultimaLocalizacao: "",
      descricaoDetalhada: "",
      contacto: "",
      categoria: "",
      foto: null,
    });
    setPreview(null);
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Reportar Desaparecimento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Foto *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChooseImage}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <img
              src={preview}
              alt="Pré-visualização"
              className="mt-3 w-full rounded-lg shadow-md"
            />
          )}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nome *</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Idade */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Idade *</label>
          <input
            name="idade"
            type="number"
            value={form.idade}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Gênero */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Gênero *</label>
          <select
            name="genero"
            value={form.genero}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Selecione o gênero</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Última Localização */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Última Localização *
          </label>
          <select
            name="ultimaLocalizacao"
            value={form.ultimaLocalizacao}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Selecione a localização</option>
            <option value="Maputo">Maputo</option>
            <option value="Matola">Matola</option>
            <option value="Boane">Boane</option>
            <option value="Gaza">Gaza</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Descrição Detalhada *
          </label>
          <textarea
            name="descricaoDetalhada"
            value={form.descricaoDetalhada}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Contacto */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Contacto do Responsável *
          </label>
          <input
            name="contacto"
            type="tel"
            value={form.contacto}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="criança">Criança</option>
            <option value="adulto">Adulto</option>
            <option value="idoso">Idoso</option>
            <option value="rapto">Rapto</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Publicando..." : "Publicar"}
        </button>
      </form>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Faça login ou crie uma conta</h3>
            <p className="text-gray-600 mb-4">
              É necessário ter uma conta para enviar uma denúncia.
            </p>
            <button
              onClick={() => {
                setShowLoginModal(false);
                navigate("/signin");
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2 hover:bg-blue-700"
            >
              Fazer Login
            </button>
            <button
              onClick={() => {
                setShowLoginModal(false);
                navigate("/signup");
              }}
              className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50"
            >
              Criar Conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
