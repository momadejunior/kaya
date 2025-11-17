import React from 'react';
import { Link } from 'react-router-dom';
import Image from 'react'


export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-10 py-6 sticky top-0 bg-white bg-opacity-90 shadow-md z-10" id="navbar">
      <Link to="/">
         <img
            src="./logo.png"
            alt="VuyaKaya"
            className='w-32'
          />
      </Link>
      <nav className="space-x-6">
        <Link
          to="#"
          className="hover:text-[#DA1C5C] font-medium"
          onClick={() => {
            const element = document.getElementById('home');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Início
        </Link>
        <Link
          to="#"
          className="hover:text-[#DA1C5C] font-medium"
          onClick={() => {
            const element = document.getElementById('features');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Funcionalidades
        </Link>
      </nav>
    </header>
  );
}
