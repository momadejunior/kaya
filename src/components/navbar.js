import React from 'react';
import { Link } from 'react-router-dom';


export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-10 py-6 sticky top-0 bg-white bg-opacity-90 shadow-md z-10">
      <Link to="/"><h1 className="text-[#DA1C5C] font-extrabold text-2xl">Vuyakaya</h1></Link>
      <nav className="space-x-6">
        <Link to="/" className="hover:text-[#DA1C5C] font-medium">Início</Link>
        <Link to="/confirm" className="hover:text-[#DA1C5C] font-medium">Funcionalidades</Link>
      </nav>
    </header>
  );
}
