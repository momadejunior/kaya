import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import Tesseract from "tesseract.js"; 
import { 
  IoCloudUploadOutline, 
  IoMapOutline, 
  IoAddCircleOutline, 
  IoTrashOutline,
  IoPersonOutline,
  IoCallOutline,
  IoInformationCircleOutline,
  IoSearchOutline,
  IoSparkles
} from "react-icons/io5";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Configuração do ícone do mapa
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function Reportar() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
  // Estados para a IA
  const [analyzing, setAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  const styles = {
    mainTitle: "text-3xl font-extrabold text-[#d91c5d] mb-2", 
    sectionTitle: "text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2",
    label: "block text-sm font-semibold text-gray-600 mb-1.5 tracking-wide",
    input: "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:bg-white focus:border-[#d91c5d] focus:ring-4 focus:ring-pink-100 transition-all duration-200 outline-none text-sm font-medium",
    select: "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:bg-white focus:border-[#d91c5d] focus:ring-4 focus:ring-pink-100 transition-all duration-200 outline-none text-sm font-medium appearance-none cursor-pointer",
    card: "bg-white shadow-sm border border-gray-100 rounded-2xl p-6 mb-6",
    primaryButton: "w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-0.5 hover:shadow-xl bg-[#d91c5d] hover:bg-[#b0174b]",
    aiButton: "w-full py-4 rounded-xl text-white font-bold shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 mb-8 cursor-pointer relative overflow-hidden group"
  };

  // Estado Inicial do Formulário
  const initialFormState = {
    nome: "",
    idade: "", 
    genero: "",
    ultimaLocalizacao: "",
    ultimaLocalizacaoManual: "",
    descricaoDetalhada: "",
    nomeContacto: "",
    contacto: "",
    categoria: "",
    categoriaManual: "",
    foto: null,
    latitude: null,
    longitude: null,
    dataDesaparecimento: "",
    responsaveis: [{ nome: "", contacto: "" }],
  };

  const [form, setForm] = useState(initialFormState);

  const coordsFixas = {
    Maputo: { lat: -25.9692, lon: 32.5732 },
    Matola: { lat: -25.9617, lon: 32.4607 },
    Boane: { lat: -26.0467, lon: 32.3275 },
    Gaza: { lat: -25.0440, lon: 33.6425 },
    Beira: { lat: -19.8316, lon: 34.8385 },
    Nampula: { lat: -15.1165, lon: 39.2666 },
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      else setShowLoginModal(true);
    };
    getUser();
  }, []);

  // --- MAPAS ---
  const getCoordinates = async (localizacao) => {
    if (!localizacao) return null;
    if (coordsFixas[localizacao]) return coordsFixas[localizacao];

    try {
      setLoadingMap(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          localizacao + ", Mozambique"
        )}`, { headers: { "User-Agent": "MissingPeopleMozambique/1.0" } }
      );
      const data = await res.json();
      setLoadingMap(false);
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (error) {
      console.error(error);
      setLoadingMap(false);
    }
    return null;
  };

  const updateMapCoordinates = async (localName) => {
    if(!localName) return;
    const coords = await getCoordinates(localName);
    if (coords) setForm((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lon }));
    else setForm((prev) => ({ ...prev, latitude: null, longitude: null }));
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (form.ultimaLocalizacaoManual) updateMapCoordinates(form.ultimaLocalizacaoManual);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "ultimaLocalizacao" && value !== "Outro") updateMapCoordinates(value);
  };

  // --- IA: TESSERACT + GPT ---
  const handleAIAnalysis = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setForm(prev => ({ ...prev, foto: file }));
    setAnalyzing(true);
    setAiStatus("Lendo texto da imagem (OCR)...");

    try {
      // 1. Tesseract: Extrai texto da imagem localmente
      const { data: { text } } = await Tesseract.recognize(
        file,
        'por', 
        { 
          logger: m => {
            if(m.status === 'recognizing text') {
              setAiStatus(`Lendo imagem: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      if (!text || text.length < 5) {
        throw new Error("Não foi possível ler texto suficiente na imagem.");
      }

      console.log("Texto extraído:", text);
      setAiStatus("Inteligência Artificial processando dados...");

      // 2. Supabase Function: Envia o texto para o GPT organizar
      const { data, error } = await supabase.functions.invoke('extract-missing-data', {
        body: { text: text } 
      });

      if (error) throw error;

      // 3. Preenche o formulário
      if (data) {
        console.log("Dados da IA:", data);
        
        setForm(prev => ({
          ...prev,
          nome: data.nome || prev.nome,
          idade: data.idade ? String(data.idade) : prev.idade,
          genero: data.genero || prev.genero,
          descricaoDetalhada: data.descricao || prev.descricaoDetalhada, // Mapeamento correto da descrição
          dataDesaparecimento: data.data_desaparecimento || prev.dataDesaparecimento, // Mapeamento da data
          
          // Mapeamento Inteligente dos Contactos
          nomeContacto: data.nome_responsavel || prev.nomeContacto, // Nome do responsável principal
          contacto: data.contacto || prev.contacto, // Telefone principal
          responsaveis: (data.responsaveis && data.responsaveis.length > 0) 
            ? data.responsaveis 
            : prev.responsaveis,

          categoria: data.categoria || prev.categoria,
          ultimaLocalizacao: data.ultima_localizacao ? "Outro" : prev.ultimaLocalizacao,
          ultimaLocalizacaoManual: data.ultima_localizacao || prev.ultimaLocalizacaoManual
        }));

        if (data.ultima_localizacao) {
          updateMapCoordinates(data.ultima_localizacao);
        }
        alert("Dados extraídos com sucesso! Verifique se tudo está correto.");
      }
    } catch (error) {
      console.error("Erro IA:", error);
      alert("Não foi possível extrair os dados automaticamente. Preencha manualmente.");
    } finally {
      setAnalyzing(false);
      setAiStatus("");
    }
  };

  const handleChooseImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleResponsavelChange = (index, field, value) => {
    const updated = [...form.responsaveis];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, responsaveis: updated }));
  };

  const addResponsavel = () => {
    setForm((prev) => ({ ...prev, responsaveis: [...prev.responsaveis, { nome: "", contacto: "" }] }));
  };

  const removeResponsavel = (index) => {
    if (form.responsaveis.length > 1) {
      const updated = form.responsaveis.filter((_, i) => i !== index);
      setForm((prev) => ({ ...prev, responsaveis: updated }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.categoria || !form.foto || !form.descricaoDetalhada || !form.contacto) {
       alert("Por favor, preencha os campos obrigatórios.");
       return;
    }
    if (!userId) { setShowLoginModal(true); return; }

    setUploading(true);
    let photoUrl = null;
    try {
      const ext = form.foto.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("missing").upload(fileName, form.foto, { contentType: form.foto.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("missing").getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    } catch (error) {
      console.error(error);
      alert("Erro upload imagem.");
      setUploading(false);
      return;
    }

    const localizacaoFinal = form.ultimaLocalizacao === "Outro" ? form.ultimaLocalizacaoManual : form.ultimaLocalizacao;
    const categoriaFinal = form.categoria === "Outro" ? form.categoriaManual : form.categoria;

    const { error } = await supabase.from("missing_people").insert([
      {
        nome: form.nome,
        idade: form.idade ? parseInt(form.idade) : null,
        genero: form.genero,
        ultima_localizacao: localizacaoFinal,
        descricao_detalhada: form.descricaoDetalhada,
        nome_responsavel: form.nomeContacto,
        contacto_do_responsavel: form.contacto,
        photo_url: photoUrl,
        category: categoriaFinal,
        reported_by: userId,
        latitude: form.latitude,
        longitude: form.longitude,
        data_desaparecimento: form.dataDesaparecimento || null,
        responsaveis_nomes: form.responsaveis.map((r) => r.nome),
        responsaveis_contactos: form.responsaveis.map((r) => r.contacto),
      },
    ]);

    setUploading(false);

    if (error) {
      alert("Erro ao registrar: " + error.message);
    } else {
      // --- SUCESSO ---
      alert("Denúncia registrada com sucesso!");
      
      // 1. Limpa o formulário para o estado inicial
      setForm(initialFormState);
      
      // 2. Limpa o preview da imagem
      setPreview(null);
      
      // 3. Rola suavemente para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // O usuário permanece na página.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <h2 className={styles.mainTitle}>Reportar Desaparecimento</h2>
          <p className="text-gray-500">Tem um cartaz ou foto? Use nossa IA para preencher rápido.</p>
        </div>

        {/* BOTÃO DE IA */}
        <label className={styles.aiButton}>
            {analyzing ? (
               <div className="flex flex-col items-center">
                 <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processando...
                 </span>
                 <span className="text-xs text-indigo-100 mt-1 font-normal">{aiStatus}</span>
               </div>
            ) : (
               <>
                 <IoSparkles className="text-2xl animate-pulse text-yellow-300" />
                 <span>Carregar Cartaz e Preencher Automaticamente</span>
               </>
            )}
            <input type="file" accept="image/*" onChange={handleAIAnalysis} disabled={analyzing} className="hidden" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 transform skew-x-12" />
        </label>

        <form onSubmit={handleSubmit}>
          
          {/* CARD 1: FOTO */}
          <div className={`${styles.card} flex flex-col items-center border-2 border-transparent transition-all ${analyzing ? "border-indigo-400 shadow-indigo-100" : ""}`}>
            <label className={styles.label}>Foto da Pessoa (Obrigatório)</label>
            {preview ? (
              <div className="relative w-full max-w-sm">
                <img src={preview} alt="Preview" className="w-full h-80 object-cover rounded-2xl shadow-md" />
                <button
                  type="button"
                  onClick={() => { setForm((prev) => ({ ...prev, foto: null })); setPreview(null); }}
                  className="absolute top-3 right-3 bg-white/90 text-red-500 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-white transition"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <label className="cursor-pointer w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col justify-center items-center hover:border-[#d91c5d] hover:bg-pink-50 transition-all group">
                <div className="bg-pink-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                   <IoCloudUploadOutline className="text-3xl text-[#d91c5d]" />
                </div>
                <span className="text-gray-700 font-semibold text-lg">Clique para enviar foto</span>
                <input type="file" accept="image/*" onChange={handleChooseImage} className="hidden" />
              </label>
            )}
          </div>

          {/* CARD 2: DADOS PESSOAIS */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}><IoPersonOutline className="text-[#d91c5d]" /> Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="md:col-span-2">
                <label className={styles.label}>Nome Completo *</label>
                <input name="nome" value={form.nome} onChange={handleChange} className={styles.input} placeholder="Ex: João Manuel Sitoe" />
              </div>
              
              <div>
                <label className={styles.label}>Idade (Numérica)</label>
                <input type="number" name="idade" value={form.idade} onChange={handleChange} className={styles.input} placeholder="Ex: 25" />
              </div>

              <div>
                <label className={styles.label}>Gênero *</label>
                <div className="relative">
                    <select name="genero" value={form.genero} onChange={handleChange} className={styles.select}>
                        <option value="">Selecione...</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
              </div>

              <div>
                 <label className={styles.label}>Data do Desaparecimento</label>
                 <input type="date" name="dataDesaparecimento" value={form.dataDesaparecimento} onChange={handleChange} className={styles.input} />
              </div>

              <div className="md:col-span-2">
                  <label className={styles.label}>Categoria *</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} className={styles.select}>
                    <option value="">Selecione...</option>
                    <option value="Criança">Criança (0-12)</option>
                    <option value="Adolescente">Adolescente (13-17)</option>
                    <option value="Adulto">Adulto (18-64)</option>
                    <option value="Idoso">Idoso (65+)</option>
                    <option value="Outro">Outro (Especificar)</option>
                  </select>
                  {form.categoria === "Outro" && (
                    <div className="mt-3">
                       <input placeholder="Digite a categoria" value={form.categoriaManual} name="categoriaManual" onChange={(e) => setForm(prev => ({...prev, categoriaManual: e.target.value}))} className={styles.input} />
                    </div>
                  )}
              </div>
            </div>

            <div>
               <label className={styles.label}>Descrição Detalhada e Roupas *</label>
               <textarea name="descricaoDetalhada" value={form.descricaoDetalhada} onChange={handleChange} className={`${styles.input} min-h-[120px]`} placeholder="Características..." />
            </div>
          </div>

          {/* CARD 3: LOCALIZAÇÃO */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}><IoMapOutline className="text-[#d91c5d]" /> Localização</h3>
            
            <div className="mb-4">
              <label className={styles.label}>Cidade / Província *</label>
              <select name="ultimaLocalizacao" value={form.ultimaLocalizacao} onChange={handleChange} className={styles.select}>
                <option value="">Selecione...</option>
                <option value="Maputo">Maputo</option>
                <option value="Matola">Matola</option>
                <option value="Boane">Boane</option>
                <option value="Gaza">Gaza</option>
                <option value="Beira">Beira</option>
                <option value="Nampula">Nampula</option>
                <option value="Outro">Outro (Inserir manualmente)</option>
              </select>
            </div>

            {form.ultimaLocalizacao === "Outro" && (
              <div className="mb-4">
                <label className={styles.label}>Digite o Bairro ou Localidade</label>
                <div className="flex gap-2">
                  <input placeholder="Ex: Bairro Zimpeto" value={form.ultimaLocalizacaoManual} name="ultimaLocalizacaoManual" onChange={(e) => setForm((prev) => ({ ...prev, ultimaLocalizacaoManual: e.target.value }))} onBlur={(e) => updateMapCoordinates(e.target.value)} className={styles.input} />
                  <button type="button" onClick={handleManualSearch} className="bg-pink-100 text-[#d91c5d] px-5 rounded-xl font-bold hover:bg-pink-200 transition flex items-center gap-2"><IoSearchOutline size={18} /> Buscar</button>
                </div>
              </div>
            )}

            <div className="w-full h-72 rounded-xl overflow-hidden border border-gray-200 relative z-0 mt-2">
               {loadingMap && <div className="absolute inset-0 bg-white/80 z-[400] flex items-center justify-center font-bold text-[#d91c5d]">Buscando...</div>}
               <MapContainer center={[-25.9692, 32.5732]} zoom={10} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                  {form.latitude && form.longitude && <><RecenterMap lat={form.latitude} lng={form.longitude} /><Marker position={[form.latitude, form.longitude]}><Popup>Local</Popup></Marker></>}
               </MapContainer>
            </div>
          </div>

          {/* CARD 4: CONTACTOS */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}><IoCallOutline className="text-[#d91c5d]" /> Contactos</h3>
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={styles.label}>Seu Nome (Opcional)</label>
                        <input name="nomeContacto" value={form.nomeContacto} onChange={handleChange} className={styles.input} />
                    </div>
                    <div>
                        <label className={styles.label}>Telefone Principal *</label>
                        <input type="tel" name="contacto" value={form.contacto} onChange={handleChange} className={styles.input} />
                    </div>
                </div>
            </div>
            {/* Contactos Extras */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                    <span className="text-sm font-bold text-gray-500">Contactos Adicionais (Opcional)</span>
                    <button type="button" onClick={addResponsavel} className="text-[#d91c5d] hover:text-[#b0174b] text-sm font-bold flex items-center gap-1 transition">
                        <IoAddCircleOutline size={18} /> Adicionar Outro
                    </button>
                </div>
                {form.responsaveis.map((r, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        <input placeholder="Nome (Opcional)" value={r.nome} onChange={(e) => handleResponsavelChange(idx, "nome", e.target.value)} className={styles.input} />
                        <input placeholder="Telefone Alternativo" value={r.contacto} onChange={(e) => handleResponsavelChange(idx, "contacto", e.target.value)} className={styles.input} />
                    </div>
                    {form.responsaveis.length > 1 && (
                        <button type="button" onClick={() => removeResponsavel(idx)} className="mt-2 text-gray-400 hover:text-red-500 transition p-2"><IoTrashOutline size={20} /></button>
                    )}
                </div>
                ))}
            </div>
          </div>

          <div className="mb-20">
             <button type="submit" disabled={uploading} className={styles.primaryButton}>
                {uploading ? "Enviando..." : "PUBLICAR DENÚNCIA"}
             </button>
          </div>
        </form>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
             <h3>Faça Login</h3>
             <button onClick={() => navigate("/signin")} className="w-full bg-[#d91c5d] text-white py-2 rounded mt-4">Login</button>
             <button onClick={() => setShowLoginModal(false)} className="mt-2 text-sm text-gray-500">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}