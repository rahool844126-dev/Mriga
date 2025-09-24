import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Personality, VoiceGender } from '../types';

interface PersonalitySelectorProps {
  personalities: Personality[];
  selectedPersonality: Personality;
  onSelectPersonality: (personality: Personality) => void;
  onAddPersonality: (personality: Personality) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ personalities, selectedPersonality, onSelectPersonality, onAddPersonality }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [customGender, setCustomGender] = useState<VoiceGender>('male');
  const [secretCode, setSecretCode] = useState('');
  
  const selectorRef = useRef<HTMLDivElement>(null);

  const isCodeValid = secretCode.toLowerCase() === 'hydra';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeValid) {
        alert('Incorrect secret code. Access denied.');
        return;
    }
    if (customName && customInstruction) {
      const finalInstruction = `You are a Bihari Indian. ${customInstruction}`;
      
      const newPersonality: Personality = {
        name: customName,
        systemInstruction: finalInstruction,
        gender: customGender,
      };
      onAddPersonality(newPersonality);
      setIsModalOpen(false);
      setCustomName('');
      setCustomInstruction('');
      setCustomGender('male');
      setSecretCode('');
    }
  };
  
  const handleSelect = (personality: Personality) => {
    onSelectPersonality(personality);
    setIsDropdownOpen(false);
  };
  
  const openCustomModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto" ref={selectorRef}>
        <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="w-full px-4 py-3 text-lg text-[var(--text-primary)] bg-[var(--bg-component)] backdrop-blur-sm border-2 border-[var(--border-component)] rounded-lg flex justify-between items-center focus:outline-none focus:border-[var(--accent-color-1)]"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
        >
            <span>{selectedPersonality.name}</span>
            <svg className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        <div
            className={`absolute z-20 w-full mt-2 bg-[var(--bg-component)] border-2 border-[var(--border-component)] rounded-lg shadow-lg transition-all duration-200 ease-out transform origin-top ${isDropdownOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'}`}
        >
            <ul className="max-h-60 overflow-y-auto" role="listbox">
                {personalities.map((p) => (
                    <li
                        key={p.name}
                        onClick={() => handleSelect(p)}
                        className="px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--accent-color-1)] cursor-pointer"
                        role="option"
                        aria-selected={p.name === selectedPersonality.name}
                    >
                        {p.name}
                    </li>
                ))}
                <li
                    onClick={openCustomModal}
                    className="px-4 py-3 font-bold text-[var(--accent-color-1)] hover:bg-[var(--accent-color-2)] hover:text-[var(--accent-text)] cursor-pointer border-t-2 border-[var(--border-component)]"
                    role="option"
                >
                    + Create New Persona...
                </li>
            </ul>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-lg p-8 mx-4 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create Custom Persona</h2>
            <form onSubmit={handleCustomSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Persona Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-3 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="System Instruction (e.g., 'You are a sarcastic robot...'). All custom personas are Bihari Indian by default."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="w-full p-3 text-white bg-gray-700 rounded-md h-36 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Voice Gender</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={customGender === 'male'}
                      onChange={() => setCustomGender('male')}
                      className="form-radio h-5 w-5 text-violet-500 bg-gray-700 border-gray-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-white">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={customGender === 'female'}
                      onChange={() => setCustomGender('female')}
                      className="form-radio h-5 w-5 text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-white">Female</span>
                  </label>
                </div>
              </div>
               <div className="mb-6">
                <input
                  type="password"
                  placeholder="Enter Secret Code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full p-3 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isCodeValid}
                  className="px-6 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalitySelector;