import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { IoCloudUploadOutline } from "react-icons/io5";

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
    ultimaLocalizacaoManual: "",
    descricaoDetalhada: "",
    contacto: "",
    categoria: "",
    categoriaManual: "",
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

    const {
      nome,
      idade,
      genero,
      ultimaLocalizacao,
      ultimaLocalizacaoManual,
      descricaoDetalhada,
      contacto,
      categoria,
      categoriaManual,
      foto,
    } = form;

    // Validações
    if (
      !nome ||
      !idade ||
      !genero ||
      (!ultimaLocalizacao && !ultimaLocalizacaoManual) ||
      !descricaoDetalhada ||
      !contacto ||
      (!categoria && !categoriaManual)
    ) {
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

    // Define valores finais
    const ultimaLocalizacaoFinal =
      ultimaLocalizacao === "Outro" ? ultimaLocalizacaoManual : ultimaLocalizacao;
    const categoriaFinal = categoria === "Outro" ? categoriaManual : categoria;

    let photoUrl = null;
    try {
      setUploading(true);
      const ext = foto.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("missing")
        .upload(fileName, foto, { contentType: foto.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("missing")
        .getPublicUrl(fileName);

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
        ultima_localizacao: ultimaLocalizacaoFinal,
        descricao_detalhada: descricaoDetalhada,
        contacto_do_responsavel: contacto,
        photo_url: photoUrl,
        category: categoriaFinal,
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
      ultimaLocalizacaoManual: "",
      descricaoDetalhada: "",
      contacto: "",
      categoria: "",
      categoriaManual: "",
      foto: null,
    });
    setPreview(null);
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-500">
        Reportar Desaparecimento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FOTO */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Foto *</label>
          <label className="cursor-pointer w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col justify-center items-center hover:border-pink-500 transition">
            <IoCloudUploadOutline className="text-5xl text-pink-400 mb-2" />
            <span className="text-pink-600 text-sm">Clique para enviar a foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleChooseImage}
              className="hidden"
            />
          </label>
          {preview && (
            <img
              src={preview}
              alt="Pré-visualização"
              className="mt-3 w-full rounded-lg shadow-md"
            />
          )}
        </div>

        {/* NOME */}
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

        {/* IDADE */}
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

        {/* GÊNERO */}
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

        {/* ÚLTIMA LOCALIZAÇÃO */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Última Localização *</label>
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

          {form.ultimaLocalizacao === "Outro" && (
            <input
              placeholder="Digite a localização manualmente"
              value={form.ultimaLocalizacaoManual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ultimaLocalizacaoManual: e.target.value }))
              }
              className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Descrição Detalhada *</label>
          <textarea
            name="descricaoDetalhada"
            value={form.descricaoDetalhada}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* CONTACTO */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Contacto do Responsável *</label>
          <input
            name="contacto"
            type="tel"
            value={form.contacto}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* CATEGORIA */}
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
            <option value="Criança">Criança</option>
            <option value="Adolescente">Adolescente</option>
            <option value="Adulto">Adulto</option>
            <option value="Idoso">Idoso</option>
            <option value="Rapto">Rapto</option>
            <option value="Outro">Outro</option>
          </select>

          {form.categoria === "Outro" && (
            <input
              placeholder="Digite a categoria"
              value={form.categoriaManual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoriaManual: e.target.value }))
              }
              className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>

        {/* BOTÃO */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
            uploading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {uploading ? "Publicando..." : "Publicar"}
        </button>
      </form>

      {/* MODAL DE LOGIN */}
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
