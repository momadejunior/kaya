import React from 'react';
import { Link } from 'react-router';

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section
        id="home"
        className="flex flex-col md:flex-row items-center justify-between px-10 py-20 bg-gradient-to-br from-[#DA1C5C] to-pink-400 text-white"
      >
        <div className="md:w-1/2 mb-10 md:mb-0 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Conecte Esperança.<br />
            Encontre Pessoas Desaparecidas.
          </h2>
          <p className="text-lg max-w-md">
            O Vuyakaya é um aplicativo que ajuda famílias e comunidades a encontrar pessoas desaparecidas de forma rápida, segura e colaborativa.
          </p>
          <a
            href="https://github.com/momadejunior/vuyakaya.realease/releases/download/v1.0.0/vuyakaya.apk"
            download
            className="inline-block bg-white text-[#DA1C5C] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 mr-2"
          >
            Baixar para Android
          </a>

           <a
            href="/signin"
        
            className="inline-block bg-white text-[#DA1C5C] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Entrar
          </a>
        </div>
        <div className="justify-center md:w-1/2 flex hidden-on-mobile">
          <img
            src="./mobile-01.png"
            alt="App Preview"
            className="w-72 md:w-64 rounded-3xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-10 py-20 text-center">
        <h3 className="text-[#DA1C5C] text-3xl font-bold mb-16">Por que usar o Vuyakaya?</h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:-translate-y-4 transform transition border-2 border-transparent hover:border-[#DA1C5C]">
            <div className="text-[#DA1C5C] mb-4 text-5xl">
              📍
            </div>
            <h4 className="font-bold text-xl mb-2">Mapeamento em tempo real</h4>
            <p>Visualize no mapa os casos de desaparecimento reportados e ajude a compartilhar informações.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:-translate-y-4 transform transition border-2 border-transparent hover:border-[#DA1C5C]">
            <div className="text-[#DA1C5C] mb-4 text-5xl">
              🔔
            </div>
            <h4 className="font-bold text-xl mb-2">Notificações rápidas</h4>
            <p>Receba alertas sobre pessoas desaparecidas próximas à sua área.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:-translate-y-4 transform transition border-2 border-transparent hover:border-[#DA1C5C]">
            <div className="text-[#DA1C5C] mb-4 text-5xl">
              🤝
            </div>
            <h4 className="font-bold text-xl mb-2">Comunidade colaborativa</h4>
            <p>Ajude outras pessoas compartilhando informações e fortalecendo a esperança.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white text-center px-10 py-12">
        <p>© 2025 Vuyakaya. Todos os direitos reservados.</p>
        <p>
          Desenvolvido por{' '}
          <a
            href="https://www.momadejunior.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#DA1C5C] font-semibold"
          >
            Momade Júnior
          </a>
        </p>
      </footer>
    </div>
  );
}
