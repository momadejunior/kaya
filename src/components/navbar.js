import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('/default-avatar.png'); // avatar padrão
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single();

        if (!error && profileData?.avatar_url) {
          setAvatar(profileData.avatar_url);
        }
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        supabase.from('profiles')
          .select('avatar_url')
          .eq('id', sessionUser.id)
          .single()
          .then(res => {
            if (res.data?.avatar_url) setAvatar(res.data.avatar_url);
            else setAvatar('/default-avatar.png');
          });
      } else {
        setAvatar('/default-avatar.png');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatar('/default-avatar.png');
    navigate('/signin');
  };

  return (
    <header className="flex justify-between items-center px-10 py-6 sticky top-0 bg-white bg-opacity-90 shadow-md z-10">
      <Link to="/">
        <img src="./logo.png" alt="VuyaKaya" className="w-32" />
      </Link>

      <nav className="flex items-center space-x-6">
        <Link
          to="#"
          className="hover:text-[#DA1C5C] font-medium hidden-on-mobile"
          onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Início
        </Link>
        <Link
          to="#"
          className="hover:text-[#DA1C5C] font-medium hidden-on-mobile"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Funcionalidades
        </Link>

        {user ? (
          <div className="relative">
            {/* Avatar do usuário */}
            <img
              src={avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-20">
                <Link
                  to="/perfil"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Perfil
                </Link>

                <Link
                  to={`/perfil/${user.id}/Notificacoes`}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Notificações
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="bg-pink-600 text-white rounded p-2 hover:bg-pink-700 transition">
            <Link to="/signin" className="hover:text-white font-medium">Entrar</Link>
          </span>
        )}
      </nav>
    </header>
  );
}
