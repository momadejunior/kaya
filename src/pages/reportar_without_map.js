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
    latitude: null, // Pode manter aqui, mas vamos calcular no envio
    longitude: null,
    dataDesaparecimento: "",
    responsaveis: [{ nome: "", contacto: "" }],
  });

  // Coordenadas fixas para localidades conhecidas
  const coordsFixas = {
    Maputo: { lat: -25.6751497, lon: 32.6739924 },
    Matola: { lat: -25.9167, lon: 32.4667 },
    Boane: { lat: -25.0395, lon: 32.6551 },
    Gaza: { lat: -25.1167, lon: 32.4833 },
  };

  // Verifica usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      else setShowLoginModal(true);
    };
    getUser();
  }, []);

  // --- REMOVI O USEEFFECT DAS COORDENADAS DAQUI ---
  // Isso evita fazer chamadas excessivas a API enquanto digita

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResponsavelChange = (index, field, value) => {
    const updated = [...form.responsaveis];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, responsaveis: updated }));
  };

  const addResponsavel = () => {
    setForm((prev) => ({
      ...prev,
      responsaveis: [...prev.responsaveis, { nome: "", contacto: "" }],
    }));
  };

  const removeResponsavel = (index) => {
    const updated = form.responsaveis.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, responsaveis: updated }));
  };

  const handleChooseImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Função auxiliar para buscar coordenadas
  const getCoordinates = async (localizacao) => {
    // 1. Verifica se existe na lista fixa
    if (coordsFixas[localizacao]) {
      return coordsFixas[localizacao];
    }

    // 2. Se não, busca na API
    try {
      // Adicionado delay de segurança ou header se necessário, mas o fetch direto costuma funcionar se não for spam
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          localizacao + ", Mozambique"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
    return { lat: null, lon: null };
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
      dataDesaparecimento,
      responsaveis,
    } = form;

    // Validação básica
    if (
      !nome ||
      !idade ||
      !genero ||
      (!ultimaLocalizacao && !ultimaLocalizacaoManual) ||
      !descricaoDetalhada ||
      !contacto ||
      !categoria
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!foto) {
      alert("Selecione uma foto.");
      return;
    }

    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    setUploading(true);

    // --- LÓGICA DE COORDENADAS MOVIDA PARA CÁ ---
    let finalLat = null;
    let finalLon = null;
    
    const localizacaoTexto = ultimaLocalizacao === "Outro" ? ultimaLocalizacaoManual : ultimaLocalizacao;
    
    if (localizacaoTexto) {
        const coords = await getCoordinates(localizacaoTexto);
        finalLat = coords.lat;
        finalLon = coords.lon;
        console.log("Coordenadas obtidas:", finalLat, finalLon); // Debug
    }
    // ---------------------------------------------

    // Upload da foto
    let photoUrl = null;
    try {
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

    // Categoria final
    const categoriaFinal = categoria === "Outro" ? categoriaManual : categoria;

    // Envia para Supabase
    const { error } = await supabase.from("missing_people").insert([
      {
        nome,
        idade: parseInt(idade),
        genero,
        ultima_localizacao: localizacaoTexto,
        descricao_detalhada: descricaoDetalhada,
        contacto_do_responsavel: contacto,
        photo_url: photoUrl,
        category: categoriaFinal,
        reported_by: userId,
        latitude: finalLat,  // Usando a variável local
        longitude: finalLon, // Usando a variável local
        data_desaparecimento: dataDesaparecimento || null,
        responsaveis_nomes: responsaveis.map((r) => r.nome),
        responsaveis_contactos: responsaveis.map((r) => r.contacto),
      },
    ]);

    setUploading(false);

    if (error) {
      console.error(error);
      alert("Não foi possível enviar a denúncia: " + error.message);
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
      latitude: null,
      longitude: null,
      dataDesaparecimento: "",
      responsaveis: [{ nome: "", contacto: "" }],
    });
    setPreview(null);
  };

  return (
    // ... (O RESTO DO SEU JSX CONTINUA IGUAL) ...
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-500">
        Reportar Desaparecimento
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FOTO */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Foto *</label>
          {preview ? (
            <div className="relative w-full">
              <img src={preview} alt="Pré-visualização" className="w-full rounded-lg shadow-md" />
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, foto: null }));
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg hover:bg-black/70"
              >
                Trocar imagem
              </button>
            </div>
          ) : (
            <label className="cursor-pointer w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col justify-center items-center hover:border-pink-500 transition">
              <IoCloudUploadOutline className="text-5xl text-pink-400 mb-2" />
              <span className="text-pink-600 text-sm">Clique para enviar a foto</span>
              <input type="file" accept="image/*" onChange={handleChooseImage} className="hidden" />
            </label>
          )}
        </div>

        {/* NOME, IDADE, GÊNERO */}
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Nome *" name="nome" value={form.nome} onChange={handleChange} className="border px-3 py-2 rounded-lg" />
          <input placeholder="Idade *" type="number" name="idade" value={form.idade} onChange={handleChange} className="border px-3 py-2 rounded-lg" />
          <select name="genero" value={form.genero} onChange={handleChange} className="border px-3 py-2 rounded-lg">
            <option value="">Gênero *</option>
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
            className="w-full border px-3 py-2 rounded-lg"
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
              onChange={(e) => setForm((prev) => ({ ...prev, ultimaLocalizacaoManual: e.target.value }))}
              className="w-full mt-2 border px-3 py-2 rounded-lg"
              required
            />
          )}
        </div>

        {/* DATA DESAPARECIMENTO */}
        <input
          type="date"
          name="dataDesaparecimento"
          value={form.dataDesaparecimento}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />

        {/* DESCRIÇÃO */}
        <textarea
          placeholder="Descrição Detalhada *"
          name="descricaoDetalhada"
          value={form.descricaoDetalhada}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          rows={4}
        />

        {/* CONTACTO */}
        <input
          placeholder="Contacto do Responsável *"
          type="tel"
          name="contacto"
          value={form.contacto}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />

        {/* CATEGORIA */}
        <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg">
          <option value="">Categoria *</option>
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
            onChange={(e) => setForm((prev) => ({ ...prev, categoriaManual: e.target.value }))}
            className="w-full mt-2 border px-3 py-2 rounded-lg"
            required
          />
        )}

        {/* RESPONSÁVEIS */}
        <div>
          <h4 className="font-semibold mb-2">Responsáveis</h4>
          {form.responsaveis.map((r, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input placeholder="Nome" value={r.nome} onChange={(e) => handleResponsavelChange(idx, "nome", e.target.value)} className="border px-3 py-2 rounded-lg flex-1" />
              <input placeholder="Contacto" value={r.contacto} onChange={(e) => handleResponsavelChange(idx, "contacto", e.target.value)} className="border px-3 py-2 rounded-lg flex-1" />
              {idx > 0 && <button type="button" onClick={() => removeResponsavel(idx)} className="text-red-500 font-bold">X</button>}
            </div>
          ))}
          <button type="button" onClick={addResponsavel} className="text-blue-500 font-semibold">Adicionar Responsável</button>
        </div>

        {/* BOTÃO */}
        <button type="submit" disabled={uploading} className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${uploading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"}`}>
          {uploading ? "Publicando..." : "Publicar"}
        </button>
      </form>

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Faça login ou crie uma conta</h3>
            <p className="text-gray-600 mb-4">É necessário ter uma conta para enviar uma denúncia.</p>
            <button onClick={() => { setShowLoginModal(false); navigate("/signin"); }} className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2 hover:bg-blue-700">Fazer Login</button>
            <button onClick={() => { setShowLoginModal(false); navigate("/signup"); }} className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50">Criar Conta</button>
          </div>
        </div>
      )}
    </div>
  );
}