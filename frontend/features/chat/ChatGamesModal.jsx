import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@services/firebase/config';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query,
  serverTimestamp, updateDoc, where, limit, deleteField, runTransaction
} from 'firebase/firestore';
import {
  X, Gamepad2, Target, Brain, RefreshCw,
  Send, Users, Crosshair, Shield, Move, HeartPulse
} from 'lucide-react';
import { BeastBuckBattleModal } from './games/beastbuck-battle/BeastBuckBattleModal';
import { BATTLE_GAME_ID, BATTLE_GAME_NAME } from './games/beastbuck-battle/constants';

/* ═══════════════════════════════════════════════════════════════
   GAME DEFINITIONS — Multiplayer Only (2 real players required)
   ═══════════════════════════════════════════════════════════════ */
const MULTIPLAYER_GAMES = [
  {
    id: BATTLE_GAME_ID,
    name: BATTLE_GAME_NAME,
    icon: Crosshair,
    emoji: '⚡',
    players: '2-7 Players',
    maxPlayers: 7,
    duration: '~3 min',
    description: 'A real-time 2D battle with jet movement, live projectiles, pickups, respawns, and free-for-all scoring.',
    gradient: 'from-rose-600/30 to-fuchsia-700/20',
    border: 'border-rose-500/40',
    accent: 'text-rose-300',
    accentBg: 'bg-rose-500/20',
  },
  {
    id: 'ttt',
    name: 'Tic-Tac-Toe Duel',
    icon: Target,
    emoji: '❌⭕',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~2 min',
    description: 'Classic 3x3 strategy duel. Align three marks before your opponent does.',
    gradient: 'from-violet-600/30 to-purple-700/20',
    border: 'border-violet-500/40',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/20',
  },
  {
    id: 'c4',
    name: 'Connect Four Arena',
    icon: Target,
    emoji: '🔴🟡',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~3 min',
    description: 'A bigger grid strategy battle with live turn pressure and board control.',
    gradient: 'from-blue-600/30 to-cyan-700/20',
    border: 'border-blue-500/40',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/20',
  },
  {
    id: 'rps',
    name: 'Rock Paper Scissors',
    icon: Gamepad2,
    emoji: '✊✋✌️',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~2 min',
    description: 'Best-of-5 mind game with hidden choices, instant reveals, and round history.',
    gradient: 'from-amber-600/30 to-orange-700/20',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
  },
  {
    id: 'trivia',
    name: 'Trivia Duel',
    icon: Brain,
    emoji: '🧠⚡',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~4 min',
    description: 'A randomized 5-question knowledge duel with answer reveals and final scoring.',
    gradient: 'from-emerald-600/30 to-teal-700/20',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20',
  },
];

/* ═══════════════════════════════════════════════════════════════
   TRIVIA QUESTIONS
   ═══════════════════════════════════════════════════════════════ */

const TRIVIA_QUESTIONS = [
  // Science & Thinking (40 questions)
  { q: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], answer: 'Diamond' },
  { q: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au' },
  { q: 'What is the largest organ in the human body?', options: ['Heart', 'Liver', 'Skin', 'Brain'], answer: 'Skin' },
  { q: 'What gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 'Carbon dioxide' },
  { q: 'What is the center of an atom called?', options: ['Electron', 'Nucleus', 'Proton cloud', 'Ion'], answer: 'Nucleus' },
  { q: 'What is the speed of light in vacuum?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'], answer: '300,000 km/s' },
  { q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], answer: 'Mitochondria' },
  { q: 'What is the most abundant gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 'Nitrogen' },
  { q: 'What is the boiling point of water at sea level?', options: ['90°C', '100°C', '110°C', '120°C'], answer: '100°C' },
  { q: 'What type of energy is stored in a battery?', options: ['Kinetic', 'Potential', 'Thermal', 'Nuclear'], answer: 'Potential' },
  { q: 'What is the smallest unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], answer: 'Cell' },
  { q: 'What is the process by which plants make food?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'], answer: 'Photosynthesis' },
  { q: 'What is the chemical formula for water?', options: ['HO', 'H2O', 'H2O2', 'CO2'], answer: 'H2O' },
  { q: 'What is the largest planet in our solar system?', options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], answer: 'Jupiter' },
  { q: 'What is the study of fossils called?', options: ['Geology', 'Paleontology', 'Archaeology', 'Biology'], answer: 'Paleontology' },
  { q: 'What is the process of cell division called?', options: ['Mitosis', 'Meiosis', 'Osmosis', 'Diffusion'], answer: 'Mitosis' },
  { q: 'What is the unit of electrical resistance?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 'Ohm' },
  { q: 'What is the force that pulls objects toward Earth?', options: ['Magnetism', 'Friction', 'Gravity', 'Tension'], answer: 'Gravity' },
  { q: 'What is the study of insects called?', options: ['Botany', 'Zoology', 'Entomology', 'Ornithology'], answer: 'Entomology' },
  { q: 'What is the most common element in the universe?', options: ['Oxygen', 'Carbon', 'Hydrogen', 'Helium'], answer: 'Hydrogen' },
  { q: 'What is the process of liquid turning to gas called?', options: ['Freezing', 'Melting', 'Evaporation', 'Condensation'], answer: 'Evaporation' },
  { q: 'What is the study of weather called?', options: ['Geology', 'Meteorology', 'Astronomy', 'Oceanography'], answer: 'Meteorology' },
  { q: 'What is the basic unit of heredity?', options: ['Cell', 'Gene', 'Chromosome', 'DNA'], answer: 'Gene' },
  { q: 'What is the chemical symbol for oxygen?', options: ['Ox', 'O', 'Og', 'On'], answer: 'O' },
  { q: 'What is the study of the mind and behavior called?', options: ['Sociology', 'Psychology', 'Philosophy', 'Anthropology'], answer: 'Psychology' },
  { q: 'What is the process of gas turning to liquid called?', options: ['Evaporation', 'Condensation', 'Sublimation', 'Freezing'], answer: 'Condensation' },
  { q: 'What is the largest bone in the human body?', options: ['Skull', 'Femur', 'Humerus', 'Spine'], answer: 'Femur' },
  { q: 'What is the study of earthquakes called?', options: ['Geology', 'Seismology', 'Volcanology', 'Meteorology'], answer: 'Seismology' },
  { q: 'What is the chemical symbol for sodium?', options: ['So', 'Na', 'Sd', 'Nm'], answer: 'Na' },
  { q: 'What is the process by which the body breaks down food?', options: ['Circulation', 'Digestion', 'Respiration', 'Excretion'], answer: 'Digestion' },
  { q: 'What is the study of plants called?', options: ['Zoology', 'Botany', 'Biology', 'Ecology'], answer: 'Botany' },
  { q: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton' },
  { q: 'What is the outer layer of Earth called?', options: ['Core', 'Mantle', 'Crust', 'Atmosphere'], answer: 'Crust' },
  { q: 'What is the process of solid turning to liquid called?', options: ['Freezing', 'Melting', 'Evaporation', 'Sublimation'], answer: 'Melting' },
  { q: 'What is the study of animals called?', options: ['Botany', 'Zoology', 'Biology', 'Ecology'], answer: 'Zoology' },
  { q: 'What is the chemical symbol for iron?', options: ['Ir', 'Fe', 'In', 'Io'], answer: 'Fe' },
  { q: 'What is the process by which organisms maintain stable internal conditions?', options: ['Evolution', 'Homeostasis', 'Metabolism', 'Reproduction'], answer: 'Homeostasis' },
  { q: 'What is the study of viruses called?', options: ['Bacteriology', 'Virology', 'Mycology', 'Parasitology'], answer: 'Virology' },
  { q: 'What is the SI unit of energy?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'Joule' },
  { q: 'What is the process of a solid turning directly to gas called?', options: ['Evaporation', 'Condensation', 'Sublimation', 'Deposition'], answer: 'Sublimation' },

  // Islamic History - Medieval Period (30 questions)
  { q: 'In which year did the Prophet Muhammad (PBUH) receive the first revelation?', options: ['610 CE', '622 CE', '632 CE', '570 CE'], answer: '610 CE' },
  { q: 'What is the Hijra referring to in Islamic history?', options: ['The first revelation', 'The migration to Medina', 'The Battle of Badr', 'The conquest of Mecca'], answer: 'The migration to Medina' },
  { q: 'Which year marks the beginning of the Islamic calendar?', options: ['610 CE', '622 CE', '632 CE', '570 CE'], answer: '622 CE' },
  { q: 'What was the first major battle in Islamic history?', options: ['Battle of Uhud', 'Battle of Badr', 'Battle of the Trench', 'Battle of Khaybar'], answer: 'Battle of Badr' },
  { q: 'Who was the first Caliph after the Prophet Muhammad (PBUH)?', options: ['Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib', 'Abu Bakr as-Siddiq'], answer: 'Abu Bakr as-Siddiq' },
  { q: 'Which city did the Prophet Muhammad (PBUH) migrate to during the Hijra?', options: ['Jerusalem', 'Damascus', 'Medina', 'Cairo'], answer: 'Medina' },
  { q: 'What is the name of the Prophet\'s first wife?', options: ['Aisha', 'Khadijah', 'Hafsa', 'Fatimah'], answer: 'Khadijah' },
  { q: 'Which battle is known as the Battle of the Trench?', options: ['Battle of Badr', 'Battle of Uhud', 'Battle of the Trench', 'Battle of Khandaq'], answer: 'Battle of the Trench' },
  { q: 'Who compiled the Quran into a single book during the Caliphate of Abu Bakr?', options: ['Umar ibn al-Khattab', 'Uthman ibn Affan', 'Zayd ibn Thabit', 'Ali ibn Abi Talib'], answer: 'Zayd ibn Thabit' },
  { q: 'Which Caliph ordered the standardization of the Quranic text?', options: ['Abu Bakr', 'Umar', 'Uthman', 'Ali'], answer: 'Uthman' },
  { q: 'What was the name of the Islamic state established after the Prophet\'s death?', options: ['Ottoman Empire', 'Umayyad Caliphate', 'Rashidun Caliphate', 'Abbasid Caliphate'], answer: 'Rashidun Caliphate' },
  { q: 'Which companion of the Prophet was known as "The Trusted One"?', options: ['Umar ibn al-Khattab', 'Abu Bakr as-Siddiq', 'Uthman ibn Affan', 'Ali ibn Abi Talib'], answer: 'Abu Bakr as-Siddiq' },
  { q: 'What year did the Prophet Muhammad (PBUH) pass away?', options: ['610 CE', '622 CE', '632 CE', '634 CE'], answer: '632 CE' },
  { q: 'Which battle took place in 624 CE?', options: ['Battle of Uhud', 'Battle of Badr', 'Battle of the Trench', 'Conquest of Mecca'], answer: 'Battle of Badr' },
  { q: 'Who was the Prophet\'s daughter who married Ali?', options: ['Aisha', 'Khadijah', 'Fatimah', 'Hafsa'], answer: 'Fatimah' },
  { q: 'What is the name of the cave where the Prophet received the first revelation?', options: ['Cave of Thawr', 'Cave of Hira', 'Cave of Seven Sleepers', 'Cave of Abraham'], answer: 'Cave of Hira' },
  { q: 'Which Caliph was known for his justice and was called "Al-Farooq"?', options: ['Abu Bakr', 'Umar', 'Uthman', 'Ali'], answer: 'Umar' },
  { q: 'What was the first Islamic capital city?', options: ['Mecca', 'Medina', 'Damascus', 'Baghdad'], answer: 'Medina' },
  { q: 'Who was the first person to accept Islam after Khadijah?', options: ['Ali ibn Abi Talib', 'Abu Bakr', 'Umar ibn al-Khattab', 'Zayd ibn Harithah'], answer: 'Ali ibn Abi Talib' },
  { q: 'Which battle resulted in a Muslim defeat despite numerical superiority?', options: ['Battle of Badr', 'Battle of Uhud', 'Battle of the Trench', 'Conquest of Mecca'], answer: 'Battle of Uhud' },
  { q: 'What was the Treaty of Hudaybiyyah?', options: ['A peace treaty with Mecca', 'A trade agreement', 'A military alliance', 'A marriage contract'], answer: 'A peace treaty with Mecca' },
  { q: 'Who was the Prophet\'s uncle who protected him in Mecca?', options: ['Abu Talib', 'Abu Lahab', 'Hamza', 'Abbas'], answer: 'Abu Talib' },
  { q: 'Which year did the Muslims conquer Mecca peacefully?', options: ['628 CE', '630 CE', '632 CE', '634 CE'], answer: '630 CE' },
  { q: 'Who was the first muezzin in Islam?', options: ['Bilal ibn Rabah', 'Umar ibn al-Khattab', 'Ali ibn Abi Talib', 'Abu Bakr'], answer: 'Bilal ibn Rabah' },
  { q: 'Which Caliph was assassinated while leading prayer?', options: ['Abu Bakr', 'Umar', 'Uthman', 'Ali'], answer: 'Umar' },
  { q: 'Which battle is known for the strategic use of the trench?', options: ['Battle of Badr', 'Battle of Uhud', 'Battle of the Trench', 'Battle of Khaybar'], answer: 'Battle of the Trench' },
  { q: 'Who was the general known as "The Sword of God"?', options: ['Khalid ibn al-Walid', 'Umar ibn al-Khattab', 'Ali ibn Abi Talib', 'Hamza'], answer: 'Khalid ibn al-Walid' },
  { q: 'What is the name of the Prophet\'s grandfather?', options: ['Abdul Muttalib', 'Abdullah', 'Hashim', 'Abu Talib'], answer: 'Abdul Muttalib' },
  { q: 'What was the name of the Prophet\'s foster mother?', options: ['Aminah', 'Halimah as-Sa\'diyyah', 'Khadijah', 'Fatimah'], answer: 'Halimah as-Sa\'diyyah' },
  { q: 'Who was the Prophet\'s companion known for his knowledge of hadith?', options: ['Abu Hurairah', 'Umar ibn al-Khattab', 'Ali ibn Abi Talib', 'Khalid ibn al-Walid'], answer: 'Abu Hurairah' },

  // Computer Science & Technology (25 questions)
  { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit'], answer: 'Central Processing Unit' },
  { q: 'What is the purpose of RAM in a computer?', options: ['Long-term storage', 'Temporary memory', 'Processing data', 'Graphics rendering'], answer: 'Temporary memory' },
  { q: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'HyperText Technical Protocol', 'HyperText Transmission Protocol'], answer: 'HyperText Transfer Protocol' },
  { q: 'What is an IP address?', options: ['Internet Protocol address', 'Internal Program address', 'Internet Personal address', 'Internal Protocol address'], answer: 'Internet Protocol address' },
  { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Modern Language', 'HyperText Markup Link'], answer: 'HyperText Markup Language' },
  { q: 'What is a firewall in computing?', options: ['Hardware cooling system', 'Network security system', 'Software installer', 'File compression tool'], answer: 'Network security system' },
  { q: 'What does URL stand for?', options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Universal Reference Link', 'Uniform Reference Locator'], answer: 'Uniform Resource Locator' },
  { q: 'What is the function of an operating system?', options: ['Browse internet', 'Manage computer hardware', 'Create documents', 'Play games'], answer: 'Manage computer hardware' },
  { q: 'What does Wi-Fi stand for?', options: ['Wireless Fidelity', 'Wireless Fiber', 'Wireless Frequency', 'Wireless Facility'], answer: 'Wireless Fidelity' },
  { q: 'What is a browser cache?', options: ['Storage of web files', 'Computer cooling', 'Browser security', 'Network speed'], answer: 'Storage of web files' },
  { q: 'What does VPN stand for?', options: ['Virtual Private Network', 'Virtual Public Network', 'Virtual Protocol Network', 'Virtual Protected Network'], answer: 'Virtual Private Network' },
  { q: 'What is the purpose of an algorithm?', options: ['Store data', 'Solve problems step-by-step', 'Display graphics', 'Connect to internet'], answer: 'Solve problems step-by-step' },
  { q: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], answer: 'Cascading Style Sheets' },
  { q: 'What is a database?', options: ['Collection of organized data', 'Computer program', 'Internet browser', 'Storage device'], answer: 'Collection of organized data' },
  { q: 'What does cloud computing mean?', options: ['Weather prediction', 'Storing data on internet servers', 'Computer cooling', 'Air conditioning'], answer: 'Storing data on internet servers' },
  { q: 'What is a server?', options: ['Computer that provides services', 'Food service', 'Internet browser', 'Storage device'], answer: 'Computer that provides services' },
  { q: 'What does JPEG stand for?', options: ['Joint Photographic Experts Group', 'Joint Picture Electronic Graphics', 'Joint Photo Electronic Group', 'Joint Photographic Electronic Graphics'], answer: 'Joint Photographic Experts Group' },
  { q: 'What is a computer virus?', options: ['Malicious software', 'Hardware component', 'Browser extension', 'Operating system'], answer: 'Malicious software' },
  { q: 'What does PDF stand for?', options: ['Portable Document Format', 'Personal Data File', 'Portable Data Format', 'Personal Document Format'], answer: 'Portable Document Format' },
  { q: 'What is the function of a graphics card?', options: ['Process graphics and images', 'Store documents', 'Connect to internet', 'Manage memory'], answer: 'Process graphics and images' },
  { q: 'What does USB stand for?', options: ['Universal Serial Bus', 'Universal Service Bus', 'Universal Serial Buffer', 'Universal Service Buffer'], answer: 'Universal Serial Bus' },
  { q: 'What is encryption?', options: ['Converting data into secure code', 'Deleting files', 'Compressing data', 'Backing up data'], answer: 'Converting data into secure code' },
  { q: 'What does AI stand for?', options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Integration', 'Automated Integration'], answer: 'Artificial Intelligence' },
  { q: 'What is a search engine?', options: ['Tool to find information on web', 'Computer repair tool', 'Storage device', 'Word processor'], answer: 'Tool to find information on web' },
  { q: 'What does IoT stand for?', options: ['Internet of Things', 'Internet of Technology', 'Integration of Things', 'Internet of Tools'], answer: 'Internet of Things' },

  // India (30 questions)
  { q: 'What is the capital of India?', options: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata'], answer: 'Delhi' },
  { q: 'Who was the first Prime Minister of India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Subhas Chandra Bose'], answer: 'Jawaharlal Nehru' },
  { q: 'What is the national currency of India?', options: ['Dollar', 'Euro', 'Rupee', 'Yen'], answer: 'Rupee' },
  { q: 'Which river is known as the Ganges in India?', options: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], answer: 'Ganga' },
  { q: 'What is the national flower of India?', options: ['Rose', 'Lotus', 'Sunflower', 'Marigold'], answer: 'Lotus' },
  { q: 'Which city is known as the Silicon Valley of India?', options: ['Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'], answer: 'Bangalore' },
  { q: 'What is the national bird of India?', options: ['Peacock', 'Eagle', 'Parrot', 'Sparrow'], answer: 'Peacock' },
  { q: 'Who wrote the Indian national anthem?', options: ['Rabindranath Tagore', 'Bankim Chandra', 'Sarojini Naidu', 'Premchand'], answer: 'Rabindranath Tagore' },
  { q: 'What is the national animal of India?', options: ['Lion', 'Tiger', 'Elephant', 'Leopard'], answer: 'Tiger' },
  { q: 'Which is the longest river in India?', options: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], answer: 'Ganga' },
  { q: 'What is the name of the Indian parliament?', options: ['Sansad', 'Lok Sabha', 'Rajya Sabha', 'Parliament House'], answer: 'Sansad' },
  { q: 'Which state in India is known as the "Land of Five Rivers"?', options: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'], answer: 'Punjab' },
  { q: 'What is the national sport of India?', options: ['Cricket', 'Hockey', 'Football', 'Kabaddi'], answer: 'Hockey' },
  { q: 'Which city is known as the "City of Joy"?', options: ['Mumbai', 'Kolkata', 'Delhi', 'Chennai'], answer: 'Kolkata' },
  { q: 'What is the highest civilian award in India?', options: ['Padma Shri', 'Padma Bhushan', 'Bharat Ratna', 'Padma Vibhushan'], answer: 'Bharat Ratna' },
  { q: 'Which monument is known as the "Symbol of Love"?', options: ['Red Fort', 'Taj Mahal', 'Qutub Minar', 'India Gate'], answer: 'Taj Mahal' },
  { q: 'What is the national tree of India?', options: ['Banyan', 'Neem', 'Peepal', 'Mango'], answer: 'Banyan' },
  { q: 'Which state is known as the "Spice Garden of India"?', options: ['Punjab', 'Kerala', 'Gujarat', 'Maharashtra'], answer: 'Kerala' },
  { q: 'What is the official language of the Indian government?', options: ['Hindi', 'English', 'Both Hindi and English', 'Sanskrit'], answer: 'Both Hindi and English' },
  { q: 'Which city is known as the "Pink City"?', options: ['Jaipur', 'Udaipur', 'Jodhpur', 'Bikaner'], answer: 'Jaipur' },
  { q: 'What is the national anthem of India called?', options: ['Jana Gana Mana', 'Vande Mataram', 'Saare Jahan Se Achha', 'Maa Tujhe Salaam'], answer: 'Jana Gana Mana' },
  { q: 'Which state is known as the "Land of the Rising Sun"?', options: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Nagaland'], answer: 'Arunachal Pradesh' },
  { q: 'What is the name of the Indian space agency?', options: ['ISRO', 'NASA', 'ESA', 'CNSA'], answer: 'ISRO' },
  { q: 'Which city is known as the "Financial Capital of India"?', options: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'], answer: 'Mumbai' },
  { q: 'What is the national song of India?', options: ['Jana Gana Mana', 'Vande Mataram', 'Saare Jahan Se Achha', 'Maa Tujhe Salaam'], answer: 'Vande Mataram' },
  { q: 'Which state is known as the "God\'s Own Country"?', options: ['Goa', 'Kerala', 'Tamil Nadu', 'Karnataka'], answer: 'Kerala' },
  { q: 'What is the highest mountain peak in India?', options: ['K2', 'Kangchenjunga', 'Nanda Devi', 'Mount Everest'], answer: 'Kangchenjunga' },
  { q: 'Which city is known as the "City of Lakes"?', options: ['Udaipur', 'Jaipur', 'Jodhpur', 'Bikaner'], answer: 'Udaipur' },
  { q: 'What is the national fruit of India?', options: ['Apple', 'Mango', 'Banana', 'Orange'], answer: 'Mango' },
  { q: 'Which state is known as the "Land of Kings"?', options: ['Gujarat', 'Rajasthan', 'Punjab', 'Haryana'], answer: 'Rajasthan' },

  // World Geography (25 questions)
  { q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], answer: 'Pacific' },
  { q: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 'Nile' },
  { q: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], answer: 'Vatican City' },
  { q: 'What is the largest desert in the world?', options: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'], answer: 'Antarctic' },
  { q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], answer: 'Canberra' },
  { q: 'What is the largest continent by area?', options: ['Africa', 'Asia', 'Europe', 'North America'], answer: 'Asia' },
  { q: 'What is the most populous country in the world?', options: ['USA', 'India', 'China', 'Indonesia'], answer: 'India' },
  { q: 'What is the capital of Japan?', options: ['Osaka', 'Kyoto', 'Tokyo', 'Yokohama'], answer: 'Tokyo' },
  { q: 'What is the longest mountain range in the world?', options: ['Himalayas', 'Andes', 'Alps', 'Rockies'], answer: 'Andes' },
  { q: 'What is the capital of Brazil?', options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], answer: 'Brasília' },
  { q: 'What is the largest island in the world?', options: ['Greenland', 'New Guinea', 'Borneo', 'Madagascar'], answer: 'Greenland' },
  { q: 'What is the capital of Russia?', options: ['Saint Petersburg', 'Moscow', 'Novosibirsk', 'Kazan'], answer: 'Moscow' },
  { q: 'What is the highest waterfall in the world?', options: ['Niagara Falls', 'Angel Falls', 'Victoria Falls', 'Iguazu Falls'], answer: 'Angel Falls' },
  { q: 'What is the capital of Egypt?', options: ['Alexandria', 'Cairo', 'Luxor', 'Giza'], answer: 'Cairo' },
  { q: 'What is the largest bay in the world?', options: ['Hudson Bay', 'Bay of Bengal', 'Gulf of Mexico', 'Great Australian Bight'], answer: 'Bay of Bengal' },
  { q: 'What is the capital of South Africa?', options: ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban'], answer: 'Pretoria' },
  { q: 'What is the deepest lake in the world?', options: ['Caspian Sea', 'Lake Baikal', 'Lake Superior', 'Lake Victoria'], answer: 'Lake Baikal' },
  { q: 'What is the capital of Argentina?', options: ['Córdoba', 'Rosario', 'Buenos Aires', 'Mendoza'], answer: 'Buenos Aires' },
  { q: 'What is the largest coral reef system?', options: ['Great Barrier Reef', 'Belize Barrier Reef', 'Red Sea Coral Reef', 'New Caledonia Barrier Reef'], answer: 'Great Barrier Reef' },
  { q: 'What is the capital of France?', options: ['Lyon', 'Marseille', 'Paris', 'Nice'], answer: 'Paris' },
  { q: 'What is the most densely populated country?', options: ['Singapore', 'Monaco', 'Malta', 'Bahrain'], answer: 'Monaco' },
  { q: 'What is the capital of Germany?', options: ['Munich', 'Hamburg', 'Berlin', 'Frankfurt'], answer: 'Berlin' },
  { q: 'What is the largest saltwater lake?', options: ['Caspian Sea', 'Dead Sea', 'Great Salt Lake', 'Lake Van'], answer: 'Caspian Sea' },
  { q: 'What is the capital of Italy?', options: ['Milan', 'Venice', 'Rome', 'Florence'], answer: 'Rome' },
  { q: 'What is the largest river by volume?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 'Amazon' },

  // World History (20 questions)
  { q: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], answer: 'George Washington' },
  { q: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: '1945' },
  { q: 'Who discovered America in 1492?', options: ['Vasco da Gama', 'Christopher Columbus', 'Ferdinand Magellan', 'Amerigo Vespucci'], answer: 'Christopher Columbus' },
  { q: 'What was the name of the ship that sank in 1912?', options: ['Lusitania', 'Titanic', 'Bismarck', 'Queen Mary'], answer: 'Titanic' },
  { q: 'Who built the Great Wall of China?', options: ['Mongols', 'Qin Dynasty', 'Han Dynasty', 'Ming Dynasty'], answer: 'Qin Dynasty' },
  { q: 'In which year did the French Revolution begin?', options: ['1776', '1789', '1799', '1815'], answer: '1789' },
  { q: 'Who was the first woman to fly solo across the Atlantic?', options: ['Bessie Coleman', 'Amelia Earhart', 'Harriet Quimby', 'Jacqueline Cochran'], answer: 'Amelia Earhart' },
  { q: 'What ancient civilization built the pyramids?', options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'], answer: 'Egyptians' },
  { q: 'Who wrote the Declaration of Independence?', options: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'], answer: 'Thomas Jefferson' },
  { q: 'What was the Cold War between?', options: ['USA and USSR', 'USA and China', 'UK and Germany', 'France and Russia'], answer: 'USA and USSR' },
  { q: 'Who was the first Emperor of Rome?', options: ['Julius Caesar', 'Augustus', 'Nero', 'Caligula'], answer: 'Augustus' },
  { q: 'In which year did the Berlin Wall fall?', options: ['1987', '1988', '1989', '1990'], answer: '1989' },
  { q: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], answer: 'Leonardo da Vinci' },
  { q: 'What ancient wonder was located in Alexandria?', options: ['Hanging Gardens', 'Lighthouse', 'Colossus', 'Mausoleum'], answer: 'Lighthouse' },
  { q: 'Who was the leader of the Civil Rights Movement in USA?', options: ['Malcolm X', 'Martin Luther King Jr.', 'Rosa Parks', 'Nelson Mandela'], answer: 'Martin Luther King Jr.' },
  { q: 'What empire was ruled by Genghis Khan?', options: ['Roman Empire', 'Mongol Empire', 'Ottoman Empire', 'Persian Empire'], answer: 'Mongol Empire' },
  { q: 'In which year did World War I begin?', options: ['1912', '1914', '1916', '1918'], answer: '1914' },
  { q: 'Who was the first person to reach the South Pole?', options: ['Roald Amundsen', 'Robert Falcon Scott', 'Ernest Shackleton', 'James Cook'], answer: 'Roald Amundsen' },
  { q: 'What was the capital of the Byzantine Empire?', options: ['Rome', 'Athens', 'Constantinople', 'Alexandria'], answer: 'Constantinople' },
  { q: 'Who invented the printing press?', options: ['Galileo', 'Johannes Gutenberg', 'Leonardo da Vinci', 'Isaac Newton'], answer: 'Johannes Gutenberg' },

  // Civics & Politics (20 questions)
  { q: 'What is the supreme law of the United States?', options: ['Declaration of Independence', 'Constitution', 'Bill of Rights', 'Magna Carta'], answer: 'Constitution' },
  { q: 'How many branches of government exist in the US?', options: ['2', '3', '4', '5'], answer: '3' },
  { q: 'What is the term for a country ruled by a king or queen?', options: ['Republic', 'Democracy', 'Monarchy', 'Dictatorship'], answer: 'Monarchy' },
  { q: 'What is the main duty of the judicial branch?', options: ['Make laws', 'Enforce laws', 'Interpret laws', 'Vote on laws'], answer: 'Interpret laws' },
  { q: 'What is the term for voting in an election?', options: ['Census', 'Ballot', 'Suffrage', 'Referendum'], answer: 'Suffrage' },
  { q: 'What is the upper house of the US Congress called?', options: ['House of Representatives', 'Senate', 'Supreme Court', 'Cabinet'], answer: 'Senate' },
  { q: 'What is a democracy?', options: ['Rule by one person', 'Rule by the people', 'Rule by military', 'Rule by the wealthy'], answer: 'Rule by the people' },
  { q: 'What is the term for a citizen\'s rights and responsibilities?', options: ['Privileges', 'Civics', 'Citizenship', 'Liberty'], answer: 'Citizenship' },
  { q: 'What is the length of a US presidential term?', options: ['4 years', '6 years', '8 years', '2 years'], answer: '4 years' },
  { q: 'What is the name of the first ten amendments to the US Constitution?', options: ['Articles of Confederation', 'Bill of Rights', 'Declaration of Rights', 'Constitutional Amendments'], answer: 'Bill of Rights' },
  { q: 'What is the term for a system where government controls the economy?', options: ['Capitalism', 'Socialism', 'Communism', 'Fascism'], answer: 'Communism' },
  { q: 'What is the role of the executive branch?', options: ['Make laws', 'Enforce laws', 'Interpret laws', 'Review laws'], answer: 'Enforce laws' },
  { q: 'What is the minimum age to become US President?', options: ['30', '35', '40', '45'], answer: '35' },
  { q: 'What is the legislative branch responsible for?', options: ['Enforcing laws', 'Making laws', 'Interpreting laws', 'Judging laws'], answer: 'Making laws' },
  { q: 'What is the term for government by the wealthy?', options: ['Democracy', 'Oligarchy', 'Plutocracy', 'Aristocracy'], answer: 'Plutocracy' },
  { q: 'How many justices serve on the US Supreme Court?', options: ['7', '8', '9', '10'], answer: '9' },
  { q: 'What is the vice president\'s role in the Senate?', options: ['Voting member', 'Presiding officer', 'Speaker', 'Committee chair'], answer: 'Presiding officer' },
  { q: 'What is the term for a system where power is divided between national and state governments?', options: ['Unitary system', 'Federal system', 'Confederation', 'Centralized system'], answer: 'Federal system' },
  { q: 'What is the process called when citizens can remove an official from office?', options: ['Impeachment', 'Recall', 'Censure', 'Expulsion'], answer: 'Recall' },
  { q: 'What is the term for freedom from government control?', options: ['Liberty', 'Justice', 'Equality', 'Fraternity'], answer: 'Liberty' },

  // Original Technology Questions (7 unique questions - preserved from original set)
  { q: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Array', 'Tree'], answer: 'Queue' },
  { q: 'HTTP status code for "Created"?', options: ['200', '201', '404', '500'], answer: '201' },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
  { q: 'What does API stand for?', options: ['Application Programming Interface', 'Applied Program Index', 'Automated Process Input', 'Application Page Instance'], answer: 'Application Programming Interface' },
  { q: 'Which unit measures electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt-hour'], answer: 'Ampere' },
  { q: 'What is the binary value of decimal 5?', options: ['101', '110', '011', '111'], answer: '101' },
  { q: 'Which HTML tag creates a link?', options: ['<a>', '<linker>', '<href>', '<url>'], answer: '<a>' },

  // Additional General Knowledge (20 questions)
  { q: 'What is the most spoken language in the world?', options: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'], answer: 'Mandarin Chinese' },
  { q: 'What is the currency of Japan?', options: ['Yuan', 'Won', 'Yen', 'Ringgit'], answer: 'Yen' },
  { q: 'What is the currency of the European Union?', options: ['Dollar', 'Pound', 'Euro', 'Franc'], answer: 'Euro' },
  { q: 'What is the longest river in Asia?', options: ['Ganges', 'Yangtze', 'Mekong', 'Indus'], answer: 'Yangtze' },
  { q: 'What is the currency of South Korea?', options: ['Yen', 'Won', 'Yuan', 'Ringgit'], answer: 'Won' },
  { q: 'What is the largest desert in Asia?', options: ['Gobi', 'Thar', 'Karakum', 'Taklamakan'], answer: 'Gobi' },
  { q: 'What is the highest mountain in Europe?', options: ['Mont Blanc', 'Matterhorn', 'Elbrus', 'Mont Blanc'], answer: 'Elbrus' },
  { q: 'What is the currency of Russia?', options: ['Ruble', 'Euro', 'Dollar', 'Pound'], answer: 'Ruble' },
  { q: 'What is the largest lake in Africa?', options: ['Lake Victoria', 'Lake Tanganyika', 'Lake Malawi', 'Lake Chad'], answer: 'Lake Victoria' },
  { q: 'What is the currency of Nigeria?', options: ['Naira', 'Cedi', 'Shilling', 'Rand'], answer: 'Naira' },
  { q: 'What is the longest river in South America?', options: ['Amazon', 'Orinoco', 'Paraná', 'Magdalena'], answer: 'Amazon' },
  { q: 'What is the currency of Brazil?', options: ['Peso', 'Real', 'Dollar', 'Euro'], answer: 'Real' },
  { q: 'What is the largest island in the Mediterranean?', options: ['Sicily', 'Sardinia', 'Cyprus', 'Crete'], answer: 'Sicily' },
  { q: 'What is the currency of Turkey?', options: ['Lira', 'Dinar', 'Riyal', 'Dirham'], answer: 'Lira' },
  { q: 'What is the most populous city in the world?', options: ['Tokyo', 'Delhi', 'Shanghai', 'São Paulo'], answer: 'Tokyo' },
  { q: 'What is the currency of Saudi Arabia?', options: ['Dinar', 'Riyal', 'Dirham', 'Rial'], answer: 'Riyal' },
  { q: 'What is the largest rainforest in the world?', options: ['Amazon', 'Congo', 'Daintree', 'Monteverde'], answer: 'Amazon' },
  { q: 'What is the currency of Mexico?', options: ['Peso', 'Real', 'Dollar', 'Euro'], answer: 'Peso' },
  { q: 'What is the largest coral formation?', options: ['Great Barrier Reef', 'Belize Barrier Reef', 'Red Sea Coral Reef', 'New Caledonia Barrier Reef'], answer: 'Great Barrier Reef' },
  { q: 'What is the currency of Australia?', options: ['Dollar', 'Pound', 'Euro', 'Rand'], answer: 'Dollar' },
];
const TRIVIA_DUEL_LENGTH = 5;

const ARENA_MAX_PLAYERS = 7;
const PLAYER_ROLES = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7'];
const ARENA_SPAWNS = {
  player1: 0,
  player2: 6,
  player3: 42,
  player4: 48,
  player5: 3,
  player6: 45,
  player7: 24,
};
const ARENA_STYLES = {
  player1: { label: 'P1', chip: 'bg-violet-500', border: 'border-violet-200', text: 'text-violet-200' },
  player2: { label: 'P2', chip: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-200' },
  player3: { label: 'P3', chip: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-200' },
  player4: { label: 'P4', chip: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-200' },
  player5: { label: 'P5', chip: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-200' },
  player6: { label: 'P6', chip: 'bg-lime-500', border: 'border-lime-200', text: 'text-lime-200' },
  player7: { label: 'P7', chip: 'bg-pink-500', border: 'border-pink-200', text: 'text-pink-200' },
};
const ARENA_MAX_HP = 100;
const ARENA_SHOT_DAMAGE = 35;
const ARENA_SHIELD_GAIN = 25;

/* ═══════════════════════════════════════════════════════════════
   GAME LOGIC HELPERS
   ═══════════════════════════════════════════════════════════════ */
function initialGameState(gameId) {
  console.log('Initializing game state for:', gameId);
  switch (gameId) {
    case 'arena': {
      const arenaState = {
        boardSize: 7,
        currentTurn: 'player1',
        winner: null,
        round: 1,
        actionCount: 0,
        players: {
          player1: createArenaPlayer('player1'),
        },
        log: ['Arena created. Invite up to 6 more players, then start the match.'],
        lastAction: null,
      };
      console.log('Arena initial state:', arenaState);
      return arenaState;
    }
    case 'ttt': {
      const tttState = { board: Array(9).fill(null), currentTurn: 'player1', winner: null };
      console.log('TTT initial state:', tttState);
      return tttState;
    }
    case 'c4': {
      const c4State = { board: Array(42).fill(null), currentTurn: 'player1', winner: null, moveCount: 0, lastMove: null };
      console.log('C4 initial state:', c4State);
      return c4State;
    }
    case 'rps': {
      const rpsState = { p1Choice: null, p2Choice: null, round: 1, p1Score: 0, p2Score: 0, bestOf: 5, roundHistory: [] };
      console.log('RPS initial state:', rpsState);
      return rpsState;
    }
    case 'trivia': {
      const questionOrder = TRIVIA_QUESTIONS
        .map((_, index) => index)
        .sort(() => Math.random() - 0.5)
        .slice(0, TRIVIA_DUEL_LENGTH);
      const triviaState = { questionIndex: 0, questionOrder, p1Answer: null, p2Answer: null, p1Score: 0, p2Score: 0, questionResults: [] };
      console.log('Trivia initial state:', triviaState);
      return triviaState;
    }
    default:
      console.error('Unknown game ID:', gameId);
      return {};
  }
}

const TTT_WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkTTTWinner(board) {
  for (const [a, b, c] of TTT_WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(cell => cell !== null)) return 'draw';
  return null;
}

function checkC4Win(board, row, col, mark) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r * 7 + c] !== mark) break;
      count++;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r * 7 + c] !== mark) break;
      count++;
    }
    if (count >= 4) return true;
  }
  return false;
}

function getRPSResult(p1, p2) {
  if (p1 === p2) return 'draw';
  if ((p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper')) return 'player1';
  return 'player2';
}

const RPS_EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' };
const RPS_LABELS = {
  rock: 'Breaks scissors',
  paper: 'Covers rock',
  scissors: 'Cuts paper',
};

function getTriviaQuestion(gameState) {
  const questionIndex = gameState?.questionOrder?.[gameState.questionIndex] ?? gameState?.questionIndex ?? 0;
  return TRIVIA_QUESTIONS[questionIndex] || TRIVIA_QUESTIONS[0];
}

function getTriviaLength(gameState) {
  return gameState?.questionOrder?.length || TRIVIA_QUESTIONS.length;
}

function getGameDefinition(gameId) {
  return MULTIPLAYER_GAMES.find(game => game.id === gameId) || null;
}

function isArenaGame(gameId) {
  return gameId === 'arena';
}

function createArenaPlayer(role) {
  return {
    hp: ARENA_MAX_HP,
    shield: 0,
    energy: 3,
    pos: ARENA_SPAWNS[role] ?? 12,
    alive: true,
  };
}

function getSessionRoles(sessionData, maxPlayers = 2) {
  return PLAYER_ROLES.slice(0, maxPlayers).filter(role => !!sessionData?.[role]?.uid);
}

function getNextOpenRole(sessionData, maxPlayers = 2) {
  return PLAYER_ROLES.slice(0, maxPlayers).find(role => !sessionData?.[role]?.uid) || null;
}

function getArenaPlayers(sessionData) {
  const gamePlayers = sessionData?.gameState?.players || {};
  return getSessionRoles(sessionData, ARENA_MAX_PLAYERS).map(role => ({
    role,
    profile: sessionData?.[role],
    state: gamePlayers[role] || createArenaPlayer(role),
  }));
}

function getAliveArenaRoles(players = {}) {
  return PLAYER_ROLES.filter(role => players[role]?.alive && players[role]?.hp > 0);
}

function getNextArenaTurn(players = {}, currentRole = 'player1') {
  const aliveRoles = getAliveArenaRoles(players);
  if (aliveRoles.length <= 1) return aliveRoles[0] || null;

  const currentIndex = PLAYER_ROLES.indexOf(currentRole);
  for (let offset = 1; offset <= PLAYER_ROLES.length; offset++) {
    const role = PLAYER_ROLES[(currentIndex + offset) % PLAYER_ROLES.length];
    if (aliveRoles.includes(role)) return role;
  }
  return aliveRoles[0];
}

function getArenaWinner(players = {}) {
  const aliveRoles = getAliveArenaRoles(players);
  return aliveRoles.length === 1 ? aliveRoles[0] : null;
}

function getArenaDistance(a, b, boardSize = 7) {
  const ar = Math.floor(a / boardSize);
  const ac = a % boardSize;
  const br = Math.floor(b / boardSize);
  const bc = b % boardSize;
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

function isArenaAdjacent(a, b, boardSize = 7) {
  return getArenaDistance(a, b, boardSize) === 1;
}

function isArenaOccupied(players = {}, pos, ignoreRole = null) {
  return PLAYER_ROLES.some(role => role !== ignoreRole && players[role]?.alive && players[role]?.pos === pos);
}

function getArenaLogLine(actorName, action, targetName = '') {
  if (action === 'move') return `${actorName} repositioned for a better angle.`;
  if (action === 'shield') return `${actorName} raised a shield.`;
  if (action === 'shot') return `${actorName} blasted ${targetName}.`;
  return `${actorName} made a move.`;
}

/* ═══════════════════════════════════════════════════════════════
   FIRESTORE REFS
   ═══════════════════════════════════════════════════════════════ */
const gamesCol = () => collection(db, 'gameSessions');
const gameDocRef = (id) => doc(db, 'gameSessions', id);

async function claimOpenSessionRole(id, userId, displayName) {
  return runTransaction(db, async (transaction) => {
    const sessionRef = gameDocRef(id);
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists()) throw new Error('This game session no longer exists');

    const sessionData = sessionSnap.data();
    if (sessionData.status !== 'waiting') throw new Error('This game is no longer available to join');
    if (PLAYER_ROLES.some(role => sessionData[role]?.uid === userId)) {
      throw new Error('You are already in this game session');
    }

    const gameDef = getGameDefinition(sessionData.gameId);
    const nextRole = getNextOpenRole(sessionData, gameDef?.maxPlayers || 2);
    if (!nextRole) throw new Error('This game is already full');

    const updates = {
      [nextRole]: { uid: userId, displayName },
      updatedAt: serverTimestamp(),
    };
    if (isArenaGame(sessionData.gameId)) {
      if (nextRole !== 'player2') {
        updates[`gameState.players.${nextRole}`] = createArenaPlayer(nextRole);
      }
    } else {
      updates.status = 'active';
    }

    transaction.update(sessionRef, updates);
    return { gameId: sessionData.gameId, role: nextRole };
  });
}

/* ═══════════════════════════════════════════════════════════════
   CHAT GAMES MODAL — Real-Time Multiplayer
   ═══════════════════════════════════════════════════════════════ */
function LegacyChatGamesModal({ onClose, currentUser, activeRoomId = 'general', onSendGameCard, joinSessionId = null, initialGameId = null, onSelectBattle }) {
  const initialSelectedGame = initialGameId ? getGameDefinition(initialGameId) : null;
  // ─── State ───────────────────────────────────────────
  const [phase, setPhase] = useState(joinSessionId ? 'playing' : initialSelectedGame ? 'lobby' : 'select'); // 'select' | 'lobby' | 'playing'
  const [selectedGame, setSelectedGame] = useState(initialSelectedGame);
  const [sessionId, setSessionId] = useState(joinSessionId);
  const [session, setSession] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [waitingSessions, setWaitingSessions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = currentUser?.uid;
  const currentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You';
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Debug: Log current user state
  useEffect(() => {
    console.log('Game Modal - Current user:', currentUser);
    console.log('Game Modal - Current name:', currentName);
    console.log('Game Modal - Current phase:', phase);
  }, [currentUser, currentName, phase]);

  // ─── Handle modal close with cleanup ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    // Cancel waiting session if we're the creator
    if (sessionId && session?.status === 'waiting' && myRole === 'player1') {
      console.log('Cancelling game session on modal close:', sessionId);
      deleteDoc(gameDocRef(sessionId)).catch((err) => {
        console.error('Failed to cancel game session on close:', err);
      });
    }
    onClose();
  }, [sessionId, session?.status, myRole, onClose]);

  // ─── Subscribe to active session ───────────────────────
  useEffect(() => {
    if (!sessionId) return;
    let hasJoined = false;

    const unsub = onSnapshot(gameDocRef(sessionId), async (snap) => {
      if (!snap.exists()) {
        setSession(null);
        setError('Game session not found or was deleted');
        return;
      }
      const data = { id: snap.id, ...snap.data() };
      setSession(data);
      setError(null);

      const currentRole = PLAYER_ROLES.find(role => data[role]?.uid === currentUserId);

      // Auto-determine role
      if (currentRole) {
        setMyRole(currentRole);
      } else if (data.status === 'waiting' && !hasJoined && joinSessionId) {
        // Auto-join for joinSessionId scenario
        hasJoined = true;
        try {
          const joined = await claimOpenSessionRole(sessionId, currentUserId, currentName);
          setMyRole(joined.role);
        } catch (err) {
          console.error('Auto-join failed:', err);
          setError('Failed to join game session');
        }
      }

      // Set game definition if not set
      setSelectedGame(prev => {
        if (prev) return prev;
        return getGameDefinition(data.gameId);
      });

      // Transition to playing when active
      if (data.status === 'active' && phaseRef.current === 'lobby') {
        setPhase('playing');
      }
    }, (err) => {
      console.error('Session subscription error:', err);
      setError('Failed to connect to game session');
    });

    return unsub;
  }, [sessionId, currentUserId, currentName, joinSessionId]);

  // ─── Subscribe to waiting sessions (lobby) ────────────
  useEffect(() => {
    if (phase !== 'lobby' || !selectedGame) return;
    const q = query(gamesCol(), where('status', '==', 'waiting'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => {
          if (s.roomId !== activeRoomId) return false;
          if (s.gameId !== selectedGame.id) return false;
          if (s.player1?.uid === currentUser?.uid) return false; // Don't show own sessions
          if (!s.player1?.uid) return false; // Invalid session
          const gameDef = getGameDefinition(s.gameId);
          if (!getNextOpenRole(s, gameDef?.maxPlayers || 2)) return false;
          const created = s.createdAt?.toMillis?.() || 0;
          return created > fifteenMinAgo;
        });
      setWaitingSessions(filtered);
    }, (err) => {
      console.error('Failed to subscribe to waiting sessions:', err);
    });
    return unsub;
  }, [phase, selectedGame, activeRoomId, currentUser?.uid]);

  // ─── Cleanup waiting session on unmount or close ────────────────
  const sessionIdRef = useRef(sessionId);
  const myRoleRef = useRef(myRole);
  const sessionStatusRef = useRef(session?.status);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);
  useEffect(() => { sessionStatusRef.current = session?.status; }, [session?.status]);

  // Auto-cancel waiting session when creator leaves modal or navigates away
  useEffect(() => {
    return () => {
      // Only delete if we're the creator and session is still waiting
      if (sessionIdRef.current && sessionStatusRef.current === 'waiting' && myRoleRef.current === 'player1') {
        console.log('Auto-cancelling game session as creator left modal:', sessionIdRef.current);
        deleteDoc(gameDocRef(sessionIdRef.current)).catch((err) => {
          console.error('Failed to cleanup game session:', err);
        });
      }
    };
  }, []);

  // ─── Actions ─────────────────────────────────────────
  const handleSelectGame = (game) => {
    if (game.id === BATTLE_GAME_ID) {
      onSelectBattle?.();
      return;
    }
    setSelectedGame(game);
    setPhase('lobby');
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setWaitingSessions([]);
    setError(null);
  };

  const handleCreateSession = async () => {
    if (isCreating || !selectedGame || !currentUser?.uid) {
      if (!currentUser?.uid) {
        setError('You must be logged in to create a game');
      }
      return;
    }

    // Check if user already has an active session
    if (sessionId && session?.status === 'waiting') {
      setError('You already have an active game session waiting for an opponent');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      console.log('Creating game session for:', selectedGame.id, 'user:', currentUser.uid);
      const gameState = initialGameState(selectedGame.id);
      console.log('Initial game state:', gameState);

      // Validate game state before creating
      if (!gameState || Object.keys(gameState).length === 0) {
        throw new Error('Invalid game state generated');
      }

      const ref = await addDoc(gamesCol(), {
        gameId: selectedGame.id,
        roomId: activeRoomId,
        status: 'waiting',
        player1: { uid: currentUser.uid, displayName: currentName },
        player2: null,
        gameState: gameState,
        winner: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Game session created with ID:', ref.id);
      setSessionId(ref.id);
      setMyRole('player1');
      setError(null);
    } catch (err) {
      console.error('Failed to create game session:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to create game session: ${errorMessage}`);
      setSessionId(null);
      setMyRole(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (id) => {
    if (!currentUser?.uid) {
      setError('You must be logged in to join a game');
      return;
    }

    // Check if we're already in this session
    if (sessionId === id) {
      setError('You are already in this game session');
      return;
    }

    try {
      console.log('Joining game session:', id, 'as user:', currentUser.uid);

      const joined = await claimOpenSessionRole(id, currentUserId, currentName);

      console.log('Successfully joined game session:', id);
      setSessionId(id);
      setMyRole(joined.role);
      setPhase(isArenaGame(joined.gameId) ? 'lobby' : 'playing');
      setError(null);
    } catch (err) {
      console.error('Failed to join session:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to join game: ${errorMessage}`);
    }
  };

  const handleBroadcast = () => {
    if (!selectedGame || !sessionId) return;
    onSendGameCard?.({
      gameId: selectedGame.id,
      title: selectedGame.name,
      description: selectedGame.description,
      sessionId,
    });
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleCancelSession = async () => {
    if (sessionId && session?.status === 'waiting' && myRole === 'player1') {
      try {
        await deleteDoc(gameDocRef(sessionId));
        console.log('Game session cancelled:', sessionId);
      } catch (err) {
        console.error('Failed to cancel game session:', err);
        setError('Failed to cancel game session');
      }
    }
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setError(null);
  };

  const handleLeaveWaitingArena = async () => {
    if (!sessionId || session?.status !== 'waiting' || selectedGame?.id !== 'arena' || !myRole) {
      handleCancelSession();
      return;
    }

    if (myRole === 'player1') {
      handleCancelSession();
      return;
    }

    try {
      await updateDoc(gameDocRef(sessionId), {
        [myRole]: null,
        [`gameState.players.${myRole}`]: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to leave arena lobby:', err);
    }

    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setError(null);
  };

  const handleBackToSelect = () => {
    handleCancelSession();
    setSelectedGame(null);
    setPhase('select');
    setWaitingSessions([]);
    setError(null);
  };

  const handleNewGame = () => {
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setPhase('lobby');
    setError(null);
  };

  const handleStartArena = async () => {
    if (!sessionId || selectedGame?.id !== 'arena' || myRole !== 'player1') return;
    const joinedRoles = getSessionRoles(session, ARENA_MAX_PLAYERS);
    if (joinedRoles.length < 2) {
      setError('Blaster Arena needs at least 2 players to start');
      return;
    }
    try {
      const arenaPlayers = joinedRoles.reduce((players, role) => {
        players[role] = session?.gameState?.players?.[role] || createArenaPlayer(role);
        return players;
      }, {});

      await updateDoc(gameDocRef(sessionId), {
        status: 'active',
        'gameState.currentTurn': 'player1',
        'gameState.players': arenaPlayers,
        'gameState.log': [`${p1Name} launched the arena match with ${joinedRoles.length} players.`],
        updatedAt: serverTimestamp(),
      });
      setPhase('playing');
    } catch (err) {
      console.error('Failed to start arena:', err);
      setError('Failed to start the arena. Please try again.');
    }
  };

  // ─── Game Move Handlers ──────────────────────────────
  const gs = session?.gameState;
  const p1Name = session?.player1?.displayName || 'Player 1';
  const p2Name = session?.player2?.displayName || 'Player 2';
  const opponentName = myRole === 'player1' ? p2Name : p1Name;
  const isMyTurn = gs?.currentTurn === myRole;
  const isFinished = session?.status === 'finished' || !!gs?.winner;

  const commitArenaState = async (players, action, targetRole = null) => {
    const winner = getArenaWinner(players);
    const nextTurn = winner ? null : getNextArenaTurn(players, myRole);
    const actorName = session?.[myRole]?.displayName || currentName;
    const targetName = targetRole ? session?.[targetRole]?.displayName || ARENA_STYLES[targetRole]?.label : '';
    const newState = {
      ...gs,
      players,
      currentTurn: nextTurn,
      winner,
      round: (gs.round || 1) + 1,
      actionCount: (gs.actionCount || 0) + 1,
      lastAction: { actor: myRole, target: targetRole, action },
      log: [getArenaLogLine(actorName, action, targetName), ...(gs.log || [])].slice(0, 5),
    };
    const updates = { gameState: newState, updatedAt: serverTimestamp() };
    if (winner) updates.status = 'finished';
    await updateDoc(gameDocRef(sessionId), updates);
  };

  const handleArenaMove = async (pos) => {
    if (!gs || selectedGame?.id !== 'arena' || !isMyTurn || !sessionId) return;
    const players = { ...(gs.players || {}) };
    const me = { ...(players[myRole] || createArenaPlayer(myRole)) };
    if (!me.alive || !isArenaAdjacent(me.pos, pos, gs.boardSize) || isArenaOccupied(players, pos, myRole)) return;
    players[myRole] = { ...me, pos, energy: Math.min(3, (me.energy || 0) + 1) };
    try {
      await commitArenaState(players, 'move');
    } catch (err) {
      console.error('Failed to move arena player:', err);
      setError('Failed to move. Please try again.');
    }
  };

  const handleArenaShield = async () => {
    if (!gs || selectedGame?.id !== 'arena' || !isMyTurn || !sessionId) return;
    const players = { ...(gs.players || {}) };
    const me = { ...(players[myRole] || createArenaPlayer(myRole)) };
    if (!me.alive) return;
    players[myRole] = {
      ...me,
      shield: Math.min(60, (me.shield || 0) + ARENA_SHIELD_GAIN),
      energy: Math.min(3, (me.energy || 0) + 1),
    };
    try {
      await commitArenaState(players, 'shield');
    } catch (err) {
      console.error('Failed to shield arena player:', err);
      setError('Failed to raise shield. Please try again.');
    }
  };

  const handleArenaShoot = async (targetRole) => {
    if (!gs || selectedGame?.id !== 'arena' || !isMyTurn || !sessionId || targetRole === myRole) return;
    const players = { ...(gs.players || {}) };
    const me = { ...(players[myRole] || createArenaPlayer(myRole)) };
    const target = { ...(players[targetRole] || {}) };
    if (!me.alive || !target.alive) return;

    const distance = getArenaDistance(me.pos, target.pos, gs.boardSize);
    const damage = Math.max(15, ARENA_SHOT_DAMAGE - Math.max(0, distance - 1) * 8);
    const shieldAbsorb = Math.min(target.shield || 0, damage);
    const nextShield = Math.max(0, (target.shield || 0) - shieldAbsorb);
    const nextHp = Math.max(0, (target.hp || 0) - (damage - shieldAbsorb));

    players[targetRole] = {
      ...target,
      shield: nextShield,
      hp: nextHp,
      alive: nextHp > 0,
    };
    players[myRole] = { ...me, energy: Math.max(0, (me.energy || 0) - 1) };

    try {
      await commitArenaState(players, 'shot', targetRole);
    } catch (err) {
      console.error('Failed to shoot arena player:', err);
      setError('Failed to fire. Please try again.');
    }
  };

  // TTT Move
  const handleTTTMove = async (idx) => {
    if (!gs || gs.winner || gs.board[idx] || !isMyTurn || !sessionId) return;
    try {
      const newBoard = [...gs.board];
      const mark = myRole === 'player1' ? 'X' : 'O';
      newBoard[idx] = mark;
      const rawWinner = checkTTTWinner(newBoard);
      let winner = null;
      if (rawWinner === 'draw') winner = 'draw';
      else if (rawWinner === 'X') winner = 'player1';
      else if (rawWinner === 'O') winner = 'player2';

      const newState = { ...gs, board: newBoard, currentTurn: myRole === 'player1' ? 'player2' : 'player1', winner };
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (winner) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to make TTT move:', err);
      setError('Failed to make move. Please try again.');
    }
  };

  // C4 Drop
  const handleC4Drop = async (col) => {
    if (!gs || gs.winner || !isMyTurn || !sessionId) return;
    try {
      const board = [...gs.board];
      let row = -1;
      for (let r = 5; r >= 0; r--) {
        if (!board[r * 7 + col]) { row = r; break; }
      }
      if (row === -1) return;
      const mark = myRole === 'player1' ? 'Red' : 'Yellow';
      board[row * 7 + col] = mark;
      const won = checkC4Win(board, row, col, mark);
      const isDraw = !won && board.every(c => c !== null);
      const winner = won ? myRole : isDraw ? 'draw' : null;

      const newState = {
        ...gs,
        board,
        currentTurn: myRole === 'player1' ? 'player2' : 'player1',
        winner,
        moveCount: (gs.moveCount || 0) + 1,
        lastMove: { row, col, mark },
      };
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (winner) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to make C4 move:', err);
      setError('Failed to make move. Please try again.');
    }
  };

  // RPS Choice (uses dot-notation partial field update to avoid write conflicts)
  const handleRPSChoice = async (choice) => {
    if (!gs || !sessionId) return;
    try {
      const myField = myRole === 'player1' ? 'p1Choice' : 'p2Choice';
      if (gs[myField]) return; // already chosen
      await updateDoc(gameDocRef(sessionId), {
        [`gameState.${myField}`]: choice,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to make RPS choice:', err);
      setError('Failed to submit choice. Please try again.');
    }
  };

  // RPS advance to next round
  const handleRPSNextRound = async () => {
    if (!gs || !gs.p1Choice || !gs.p2Choice || !sessionId) return;
    try {
      const result = getRPSResult(gs.p1Choice, gs.p2Choice);
      const newP1Score = result === 'player1' ? gs.p1Score + 1 : gs.p1Score;
      const newP2Score = result === 'player2' ? gs.p2Score + 1 : gs.p2Score;
      const winsNeeded = Math.ceil(gs.bestOf / 2);
      const gameOver = newP1Score >= winsNeeded || newP2Score >= winsNeeded;

      const newState = {
        ...gs,
        p1Choice: null, p2Choice: null,
        round: gs.round + 1,
        p1Score: newP1Score, p2Score: newP2Score,
        roundHistory: [...(gs.roundHistory || []), { round: gs.round, p1Choice: gs.p1Choice, p2Choice: gs.p2Choice, winner: result }],
      };
      if (gameOver) newState.winner = newP1Score >= winsNeeded ? 'player1' : 'player2';
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (gameOver) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to advance RPS round:', err);
      setError('Failed to advance round. Please try again.');
    }
  };

  // Trivia answer (uses dot-notation partial field update)
  const handleTriviaAnswer = async (answer) => {
    if (!gs || !sessionId) return;
    try {
      const myField = myRole === 'player1' ? 'p1Answer' : 'p2Answer';
      if (gs[myField]) return;
      await updateDoc(gameDocRef(sessionId), {
        [`gameState.${myField}`]: answer,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to submit trivia answer:', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  // Trivia advance to next question
  const handleTriviaNext = async () => {
    if (!gs || !gs.p1Answer || !gs.p2Answer || !sessionId) return;
    try {
      const correct = getTriviaQuestion(gs)?.answer;
      const newP1Score = gs.p1Answer === correct ? gs.p1Score + 1 : gs.p1Score;
      const newP2Score = gs.p2Answer === correct ? gs.p2Score + 1 : gs.p2Score;
      const isLast = gs.questionIndex + 1 >= getTriviaLength(gs);

      const newState = {
        ...gs,
        p1Answer: null, p2Answer: null,
        questionIndex: gs.questionIndex + 1,
        p1Score: newP1Score, p2Score: newP2Score,
        questionResults: [...(gs.questionResults || []), { q: gs.questionIndex, p1Answer: gs.p1Answer, p2Answer: gs.p2Answer, correct }],
      };
      if (isLast) {
        newState.winner = newP1Score > newP2Score ? 'player1' : newP2Score > newP1Score ? 'player2' : 'draw';
      }
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (isLast) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to advance trivia question:', err);
      setError('Failed to advance question. Please try again.');
    }
  };

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-3 sm:p-4 animate-fade-in" onClick={handleClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {phase !== 'select' && (
              <button
                onClick={isFinished || phase === 'lobby' ? handleBackToSelect : handleBackToSelect}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition mr-1 text-sm"
              >
                ←
              </button>
            )}
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {phase === 'select' ? 'Multiplayer Arena' : selectedGame?.name || 'Game'}
              </h2>
              <p className="text-xs text-white/50">
                {phase === 'select' && 'Real-time multiplayer duels — another member must join to play'}
                {phase === 'lobby' && (sessionId ? 'Waiting for opponent to join…' : 'Create or join a duel')}
                {phase === 'playing' && (isFinished ? 'Game Over' : (isMyTurn ? "✨ It's your turn!" : "⏳ Opponent's turn…"))}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ═══ BODY ═══ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">

          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          )}

          {/* ═══ PHASE: SELECT ═══ */}
          {phase === 'select' && (
            <div>
              <p className="text-sm text-white/60 mb-5 text-center">
                Choose a stronger multiplayer duel. Every arena requires another member to join before it starts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MULTIPLAYER_GAMES.map((game) => {
                  const Icon = game.icon;
                  return (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className={`p-5 rounded-2xl border ${game.border} bg-gradient-to-br ${game.gradient} hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer group flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl border ${game.border} ${game.accentBg} ${game.accent}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${game.border} ${game.accentBg} ${game.accent}`}>
                            {game.players}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{game.emoji}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${game.accent}`}>Power Duel</span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">{game.name}</h3>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">{game.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-white/40 font-semibold">
                        <span>⏱️ {game.duration}</span>
                        <span className={`${game.accent} group-hover:underline flex items-center gap-1`}>Open Arena →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ PHASE: LOBBY ═══ */}
          {phase === 'lobby' && (
            <div className={selectedGame?.id === 'arena' ? 'max-w-3xl mx-auto' : 'max-w-lg mx-auto'}>

              {/* Waiting for opponent (session created) */}
              {sessionId && session?.status === 'waiting' && (
                selectedGame?.id === 'arena' ? (() => {
                  const arenaPlayers = getArenaPlayers(session);
                  const joinedCount = arenaPlayers.length;
                  const canStart = myRole === 'player1' && joinedCount >= 2;

                  return (
                    <div className="py-4">
                      <div className="mb-5 overflow-hidden rounded-3xl border border-rose-400/30 bg-gradient-to-br from-rose-950/80 via-slate-950 to-cyan-950/70 shadow-2xl shadow-rose-950/30">
                        <div className="relative h-44 border-b border-white/10 bg-[radial-gradient(circle_at_20%_25%,rgba(244,63,94,0.26),transparent_28%),radial-gradient(circle_at_78%_70%,rgba(34,211,238,0.22),transparent_30%)]">
                          <div className="absolute inset-x-6 top-8 h-2 rounded-full bg-white/10" />
                          <div className="absolute bottom-8 left-10 h-2 w-32 rounded-full bg-white/10" />
                          <div className="absolute right-10 top-20 h-16 w-3 rounded-full bg-white/10" />
                          {arenaPlayers.map(({ role, profile, state }) => {
                            const boardSize = session?.gameState?.boardSize || 7;
                            const row = Math.floor((state.pos || 0) / boardSize);
                            const col = (state.pos || 0) % boardSize;
                            const style = ARENA_STYLES[role];
                            return (
                              <div
                                key={role}
                                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                                style={{ left: `${9 + col * (82 / (boardSize - 1))}%`, top: `${15 + row * (70 / (boardSize - 1))}%` }}
                              >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${style.border} ${style.chip} text-xs font-black text-white shadow-xl shadow-black/50 ring-4 ring-white/10`}>
                                  {profile?.displayName?.charAt(0)?.toUpperCase() || style.label}
                                </div>
                                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white/80 backdrop-blur">
                                  {style.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="text-lg font-extrabold text-white">Blaster Arena Lobby</h3>
                          <p className="mt-1 text-xs text-white/50">
                            {joinedCount}/{ARENA_MAX_PLAYERS} fighters joined. Start with 2 players or wait for a full squad.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {PLAYER_ROLES.map((role) => {
                          const profile = session?.[role];
                          const style = ARENA_STYLES[role];
                          return (
                            <div key={role} className={`rounded-2xl border p-3 ${profile ? 'border-white/15 bg-white/10' : 'border-dashed border-white/10 bg-white/[0.03]'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${profile ? style.chip : 'bg-white/10'} text-xs font-black text-white`}>
                                  {profile?.displayName?.charAt(0)?.toUpperCase() || '+'}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-white">{profile?.displayName || 'Open slot'}</p>
                                  <p className={`text-[10px] font-bold ${profile ? style.text : 'text-white/30'}`}>{style.label}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-col items-center gap-3">
                        {myRole === 'player1' && (
                          <button
                            onClick={handleStartArena}
                            disabled={!canStart}
                            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition ${
                              canStart
                                ? 'border-rose-300 bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500'
                                : 'cursor-not-allowed border-white/10 bg-white/5 text-white/30'
                            }`}
                          >
                            <Crosshair className="h-4 w-4" />
                            Start Battle
                          </button>
                        )}

                        <button
                          onClick={handleBroadcast}
                          disabled={inviteSent}
                          className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition ${
                            inviteSent
                              ? 'border-emerald-400 bg-emerald-600 text-white'
                              : 'border-cyan-400 bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500'
                          }`}
                        >
                          <Send className="h-4 w-4" />
                          {inviteSent ? 'Challenge Posted!' : 'Broadcast Arena Invite'}
                        </button>

                        <button onClick={handleLeaveWaitingArena} className="text-xs text-white/40 transition hover:text-white/70">
                          {myRole === 'player1' ? 'Cancel Arena' : 'Leave Lobby'}
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8">
                    <div className="relative w-36 h-36 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping" />
                      <div className="absolute inset-3 rounded-full border-2 border-indigo-400/40 animate-ping" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute inset-6 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDelay: '1s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-18 w-18 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/30" style={{ width: 72, height: 72 }}>
                          {currentName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-indigo-500 border-2 border-indigo-300 text-[10px] font-bold text-white shadow-lg">
                        Your Game
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">Searching for Opponent…</h3>
                    <p className="text-xs text-white/50 mb-6">
                      Another member needs to join this <strong className="text-indigo-300">{selectedGame?.name}</strong> duel before the game starts.
                    </p>

                    <div className="flex flex-col gap-3 items-center">
                      <button
                        onClick={handleBroadcast}
                        disabled={inviteSent}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
                          inviteSent
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        {inviteSent ? '✓ Challenge Posted to Chat!' : '🚀 Broadcast Challenge to Chat'}
                      </button>

                      <button onClick={() => { handleCancelSession(); }} className="text-xs text-white/40 hover:text-white/70 transition mt-2">
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* No session yet — Create or Join */}
              {!sessionId && (
                <div className="space-y-5">
                  <button
                    onClick={handleCreateSession}
                    disabled={isCreating || !currentUser?.uid}
                    className={`w-full p-5 rounded-2xl border transition-all duration-300 text-center group ${
                      !currentUser?.uid
                        ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
                        : 'border-indigo-500/40 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/30 hover:to-violet-600/30 cursor-pointer'
                    }`}
                  >
                    <div className="text-3xl mb-2">⚔️</div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                      {!currentUser?.uid ? 'Login Required' : isCreating ? 'Creating Duel…' : 'Create New Duel'}
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      {!currentUser?.uid ? 'You must be logged in to create games' : 'Start a session and wait for an opponent to join'}
                    </p>
                  </button>

                  {/* Open duels from other players */}
                  {waitingSessions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Open Duels in this Room ({waitingSessions.length})
                      </h4>
                      <div className="space-y-2">
                        {waitingSessions.map(s => {
                          const isMyGame = s.player1?.uid === currentUser?.uid;
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                                isMyGame
                                  ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/30'
                                  : 'border-white/10 bg-white/5 hover:bg-white/8'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                  isMyGame
                                    ? 'bg-gradient-to-br from-indigo-500 to-violet-500 ring-2 ring-indigo-300'
                                    : 'bg-gradient-to-br from-indigo-600 to-violet-600'
                                }`}>
                                  {(s.player1?.displayName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">{s.player1?.displayName || 'Unknown'}</p>
                                    {isMyGame && (
                                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-[10px] font-bold text-indigo-300">
                                        Your Game
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-white/40 flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse inline-block ${isMyGame ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                                    Waiting for opponent…
                                  </p>
                                </div>
                              </div>
                              {!isMyGame && (
                                <button
                                  onClick={() => handleJoinSession(s.id)}
                                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95"
                                >
                                  Join Duel
                                </button>
                              )}
                              {isMyGame && (
                                <button
                                  onClick={() => handleCancelSession()}
                                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold transition border border-rose-400/30 active:scale-95"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {waitingSessions.length === 0 && (
                    <div className="text-center py-4 text-xs text-white/40">
                      <p>No open duels for <strong className="text-white/60">{selectedGame?.name}</strong> in this room.</p>
                      <p className="mt-1">Create one and invite members!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ PHASE: PLAYING ═══ */}
          {phase === 'playing' && session && gs && (
            <div className={selectedGame?.id === 'arena' ? 'max-w-3xl mx-auto' : 'max-w-xl mx-auto'}>

              {/* Player Bar */}
              {selectedGame?.id !== 'arena' && (
              <div className="flex items-center justify-between mb-5 p-3 rounded-2xl border border-white/10 bg-white/5">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                  gs.currentTurn === 'player1' && !isFinished ? 'bg-violet-600/30 border border-violet-400/50 shadow-lg shadow-violet-500/10' : ''
                }`}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    {p1Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[120px]">{p1Name}</p>
                    <p className="text-[10px] text-violet-300">
                      {selectedGame?.id === 'ttt' ? 'X' : selectedGame?.id === 'c4' ? '🔴 Red' : 'P1'}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-white/40">
                  {isFinished ? <span className="text-amber-400">🏆 OVER</span> : 'VS'}
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                  gs.currentTurn === 'player2' && !isFinished ? 'bg-cyan-600/30 border border-cyan-400/50 shadow-lg shadow-cyan-500/10' : ''
                }`}>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[120px] text-right">{p2Name}</p>
                    <p className="text-[10px] text-cyan-300 text-right">
                      {selectedGame?.id === 'ttt' ? 'O' : selectedGame?.id === 'c4' ? '🟡 Yellow' : 'P2'}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    {p2Name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              )}

              {/* ─── BLASTER ARENA ─── */}
              {selectedGame?.id === 'arena' && !isFinished && (() => {
                const arenaPlayers = getArenaPlayers(session);
                const me = gs.players?.[myRole];
                const myIsAlive = !!me?.alive;
                const activeName = session?.[gs.currentTurn]?.displayName || ARENA_STYLES[gs.currentTurn]?.label || 'Fighter';
                const boardSize = gs.boardSize || 7;
                const moveTargets = me
                  ? [
                      { label: 'Up', pos: me.pos - boardSize },
                      { label: 'Left', pos: me.pos - 1 },
                      { label: 'Right', pos: me.pos + 1 },
                      { label: 'Down', pos: me.pos + boardSize },
                    ].filter(move => {
                      if (move.pos < 0 || move.pos >= boardSize * boardSize) return false;
                      if (move.label === 'Left' && me.pos % boardSize === 0) return false;
                      if (move.label === 'Right' && me.pos % boardSize === boardSize - 1) return false;
                      return !isArenaOccupied(gs.players, move.pos, myRole);
                    })
                  : [];
                const targetPlayers = arenaPlayers.filter(({ role, state }) => role !== myRole && state.alive);

                return (
                  <div className="space-y-4">
                    <div className={`rounded-2xl border px-4 py-3 text-center text-xs font-bold ${
                      isMyTurn && myIsAlive
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-white/5 text-white/50'
                    }`}>
                      {isMyTurn && myIsAlive ? 'Your combat turn: move, shield, or fire.' : `${activeName} is taking the next combat action.`}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {arenaPlayers.map(({ role, profile, state }) => {
                        const style = ARENA_STYLES[role];
                        const hpPercent = Math.max(0, Math.min(100, state.hp || 0));
                        const shieldPercent = Math.max(0, Math.min(100, ((state.shield || 0) / 60) * 100));
                        return (
                          <div key={role} className={`rounded-2xl border p-3 ${gs.currentTurn === role ? 'border-white/40 bg-white/12' : 'border-white/10 bg-white/5'} ${!state.alive ? 'opacity-45 grayscale' : ''}`}>
                            <div className="mb-2 flex items-center gap-2">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${style.chip} text-[10px] font-black text-white`}>
                                {profile?.displayName?.charAt(0)?.toUpperCase() || style.label}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white">{profile?.displayName || style.label}</p>
                                <p className={`text-[10px] font-bold ${style.text}`}>{state.alive ? `${style.label} active` : 'Knocked out'}</p>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-rose-400" style={{ width: `${hpPercent}%` }} />
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${shieldPercent}%` }} />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-white/45">
                              <span>HP {state.hp}</span>
                              <span>Shield {state.shield || 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="relative h-[360px] overflow-hidden rounded-3xl border border-rose-300/25 bg-gradient-to-br from-slate-950 via-rose-950/50 to-cyan-950/70 shadow-2xl shadow-rose-950/30">
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: `${100 / boardSize}% ${100 / boardSize}%` }} />
                      <div className="absolute left-[8%] top-[18%] h-16 w-28 rounded-full border border-white/10 bg-white/5 blur-[1px]" />
                      <div className="absolute bottom-[14%] right-[12%] h-20 w-20 rounded-3xl border border-cyan-200/10 bg-cyan-300/10 rotate-12" />
                      <div className="absolute left-[40%] top-[42%] h-24 w-5 rounded-full border border-rose-100/15 bg-rose-300/10 -rotate-12" />
                      <div className="absolute inset-x-10 bottom-8 h-1 rounded-full bg-cyan-300/20 shadow-lg shadow-cyan-300/30" />

                      {arenaPlayers.map(({ role, profile, state }) => {
                        const style = ARENA_STYLES[role];
                        const row = Math.floor((state.pos || 0) / boardSize);
                        const col = (state.pos || 0) % boardSize;
                        const lastActor = gs.lastAction?.actor === role;
                        const lastTarget = gs.lastAction?.target === role;
                        return (
                          <div
                            key={role}
                            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-500 ${!state.alive ? 'opacity-35 grayscale' : ''}`}
                            style={{ left: `${9 + col * (82 / (boardSize - 1))}%`, top: `${12 + row * (76 / (boardSize - 1))}%` }}
                          >
                            <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${style.border} ${style.chip} text-sm font-black text-white shadow-2xl shadow-black/70 ${gs.currentTurn === role ? 'ring-4 ring-white/30' : ''} ${lastActor ? 'scale-110' : ''}`}>
                              {profile?.displayName?.charAt(0)?.toUpperCase() || style.label}
                              {lastTarget && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-rose-200 shadow-lg shadow-rose-300/80" />}
                            </div>
                            <div className="mt-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
                              {style.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                          <Move className="h-4 w-4" />
                          Movement
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {moveTargets.map(move => (
                            <button
                              key={`${move.label}-${move.pos}`}
                              onClick={() => handleArenaMove(move.pos)}
                              disabled={!isMyTurn || !myIsAlive}
                              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {move.label}
                            </button>
                          ))}
                          {moveTargets.length === 0 && (
                            <div className="col-span-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-white/40">
                              No open move lanes
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                          <Crosshair className="h-4 w-4" />
                          Combat
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleArenaShield}
                            disabled={!isMyTurn || !myIsAlive}
                            className="flex items-center gap-1.5 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Shield className="h-4 w-4" />
                            Shield
                          </button>
                          {targetPlayers.map(({ role, profile, state }) => (
                            <button
                              key={role}
                              onClick={() => handleArenaShoot(role)}
                              disabled={!isMyTurn || !myIsAlive}
                              className="flex items-center gap-1.5 rounded-xl border border-rose-300/30 bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Crosshair className="h-4 w-4" />
                              {profile?.displayName || ARENA_STYLES[role].label} · {getArenaDistance(me?.pos ?? 0, state.pos, gs.boardSize)} tiles
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                        <HeartPulse className="h-4 w-4" />
                        Combat Feed
                      </h4>
                      <div className="space-y-1">
                        {(gs.log || []).map((line, index) => (
                          <p key={`${line}-${index}`} className="text-xs text-white/60">{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Score Bar (RPS & Trivia) */}
              {(selectedGame?.id === 'rps' || selectedGame?.id === 'trivia') && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-lg font-extrabold text-violet-400">{gs.p1Score || 0}</span>
                  <span className="text-white/20 text-sm">—</span>
                  <span className="text-lg font-extrabold text-cyan-400">{gs.p2Score || 0}</span>
                </div>
              )}

              {/* Turn Indicator */}
              {!isFinished && (selectedGame?.id === 'ttt' || selectedGame?.id === 'c4') && (
                <div className={`text-center text-xs font-bold mb-4 py-2 rounded-xl border transition-all duration-300 ${
                  isMyTurn
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}>
                  {isMyTurn ? "✨ Your turn — make your move!" : "⏳ Waiting for opponent's move…"}
                </div>
              )}

              {/* ─── TTT BOARD ─── */}
              {selectedGame?.id === 'ttt' && !isFinished && (
                <div className="grid grid-cols-3 gap-2.5 w-64 mx-auto mb-5">
                  {gs.board.map((cell, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTTTMove(idx)}
                      disabled={!!cell || !isMyTurn || isFinished}
                      className={`h-[76px] rounded-2xl border text-2xl font-bold transition-all duration-200 flex items-center justify-center ${
                        cell === 'X' ? 'bg-violet-600/40 border-violet-400 text-violet-200 shadow-lg shadow-violet-500/20' :
                        cell === 'O' ? 'bg-cyan-600/40 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20' :
                        isMyTurn ? 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-indigo-400 cursor-pointer' :
                        'bg-white/5 border-white/10 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              )}

              {/* ─── C4 BOARD ─── */}
              {selectedGame?.id === 'c4' && !isFinished && (
                <div className="mx-auto mb-5 w-fit rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-950 p-3 shadow-2xl shadow-cyan-950/40">
                  <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/50">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1">Moves {gs.moveCount || 0}</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1">Grid 7x6</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1">Connect 4</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {Array(7).fill(null).map((_, col) => (
                      <button
                        key={col}
                        onClick={() => handleC4Drop(col)}
                        disabled={!isMyTurn || isFinished}
                        className={`rounded-xl border px-1 py-1.5 text-xs font-black transition ${
                          isMyTurn ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 cursor-pointer' : 'border-white/5 bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                        title={`Drop in column ${col + 1}`}
                      >
                        {col + 1}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-blue-300/20 bg-blue-950/80 p-2">
                    {Array(6).fill(null).map((_, row) =>
                      Array(7).fill(null).map((_, col) => {
                        const cell = gs.board[row * 7 + col];
                        const isLastMove = gs.lastMove?.row === row && gs.lastMove?.col === col;
                        return (
                          <div
                            key={`${row}-${col}`}
                            className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full border transition-all duration-300 ${
                              cell === 'Red' ? 'bg-rose-500 border-rose-200 shadow-lg shadow-rose-500/50' :
                              cell === 'Yellow' ? 'bg-amber-400 border-amber-100 shadow-lg shadow-amber-400/50' :
                              'bg-slate-950 border-blue-800 shadow-inner'
                            } ${isLastMove ? 'ring-2 ring-white/80 scale-105' : ''}`}
                          />
                        );
                      })
                    )}
                  </div>
                  <p className="mt-3 text-center text-[11px] font-semibold text-cyan-100/70">
                    {isMyTurn ? 'Pick a column and pressure the center.' : `${opponentName} is choosing a column.`}
                  </p>
                </div>
              )}

              {/* ─── RPS GAME ─── */}
              {selectedGame?.id === 'rps' && !isFinished && (() => {
                const myChoice = myRole === 'player1' ? gs.p1Choice : gs.p2Choice;
                const oppChoice = myRole === 'player1' ? gs.p2Choice : gs.p1Choice;
                const bothChosen = myChoice && oppChoice;
                const result = bothChosen ? getRPSResult(gs.p1Choice, gs.p2Choice) : null;

                return (
                  <div className="space-y-5">
                    <div className="text-center text-xs font-bold text-amber-300 mb-2">
                      Mind duel round {gs.round} of {gs.bestOf}
                    </div>

                    {bothChosen ? (
                      /* ── Both chosen: REVEAL ── */
                      <div className="text-center space-y-4 py-4">
                        <div className="flex items-center justify-center gap-6 sm:gap-10">
                          <div className="text-center">
                            <div className="text-5xl sm:text-6xl mb-2 animate-bounce" style={{ animationDuration: '0.6s' }}>{RPS_EMOJI[myChoice]}</div>
                            <p className="text-xs font-bold text-violet-300">You</p>
                          </div>
                          <div className="text-lg font-bold text-white/20">VS</div>
                          <div className="text-center">
                            <div className="text-5xl sm:text-6xl mb-2 animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}>{RPS_EMOJI[oppChoice]}</div>
                            <p className="text-xs font-bold text-cyan-300">{opponentName}</p>
                          </div>
                        </div>
                        <div className={`text-lg font-extrabold py-2 ${
                          result === myRole ? 'text-emerald-400' : result === 'draw' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {result === myRole ? '🎉 You Win This Round!' : result === 'draw' ? "🤝 It's a Tie!" : '😔 You Lost This Round'}
                        </div>
                        <button onClick={handleRPSNextRound} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95">
                          {gs.round >= gs.bestOf ? 'Finish Match' : 'Next Round →'}
                        </button>
                      </div>
                    ) : (
                      /* ── Choosing phase ── */
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl border border-amber-400/20 bg-amber-500/5">
                          <h4 className="text-xs font-bold text-amber-300 mb-3">Lock your move:</h4>
                          {!myChoice ? (
                            <div className="flex justify-center gap-3">
                              {['rock', 'paper', 'scissors'].map(item => (
                                <button
                                  key={item}
                                  onClick={() => handleRPSChoice(item)}
                                  className="group min-w-[82px] rounded-2xl border border-white/15 bg-white/10 p-3 hover:bg-amber-400/15 hover:border-amber-300/60 transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                  <div className="text-3xl">{RPS_EMOJI[item]}</div>
                                  <div className="mt-1 text-[10px] font-bold capitalize text-white">{item}</div>
                                  <div className="text-[9px] text-white/40 group-hover:text-amber-100/70">{RPS_LABELS[item]}</div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">{RPS_EMOJI[myChoice]}</div>
                              <p className="text-xs text-emerald-400 font-bold">✓ Locked in!</p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                          <h4 className="text-xs font-bold text-cyan-300 mb-2">{opponentName}:</h4>
                          <div className="text-4xl mb-2 opacity-30">❓</div>
                          <p className="text-xs text-white/40">
                            {oppChoice ? '✓ Opponent has chosen! Make your move!' : myChoice ? 'Waiting for opponent…' : 'Both players choose simultaneously'}
                          </p>
                        </div>

                        {(gs.roundHistory || []).length > 0 && (
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Round History</h4>
                            <div className="flex flex-wrap gap-2">
                              {gs.roundHistory.map(round => (
                                <span key={round.round} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                                  R{round.round}: {RPS_EMOJI[round.p1Choice]} vs {RPS_EMOJI[round.p2Choice]} {round.winner === 'draw' ? 'draw' : round.winner === myRole ? 'win' : 'loss'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── TRIVIA DUEL ─── */}
              {selectedGame?.id === 'trivia' && !isFinished && gs.questionIndex < getTriviaLength(gs) && (() => {
                const currentQ = getTriviaQuestion(gs);
                const myAnswer = myRole === 'player1' ? gs.p1Answer : gs.p2Answer;
                const oppAnswer = myRole === 'player1' ? gs.p2Answer : gs.p1Answer;
                const bothAnswered = gs.p1Answer && gs.p2Answer;
                const totalQuestions = getTriviaLength(gs);

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300 border-b border-white/10 pb-2">
                      <span>Question {gs.questionIndex + 1} of {totalQuestions}</span>
                      <span className="text-emerald-300">Randomized set</span>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                      <p className="text-base font-bold text-white">{currentQ.q}</p>
                    </div>

                    {!myAnswer ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentQ.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleTriviaAnswer(opt)}
                            className="p-3 rounded-xl border border-white/15 bg-white/10 hover:border-emerald-400 hover:bg-emerald-400/10 text-xs font-semibold text-white text-left transition active:scale-[0.98]"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : !bothAnswered ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-3">⏳</div>
                        <p className="text-xs text-emerald-400 font-bold mb-1">Your answer submitted!</p>
                        <p className="text-xs text-white/40">Waiting for opponent to answer…</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentQ.options.map(opt => {
                          const isCorrect = opt === currentQ.answer;
                          const isMine = opt === myAnswer;
                          const isOpp = opt === oppAnswer;
                          return (
                            <div key={opt} className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                              isCorrect ? 'bg-emerald-600/30 border-emerald-400 text-white' :
                              (isMine || isOpp) ? 'bg-rose-600/20 border-rose-400/50 text-white/80' :
                              'bg-white/5 border-white/10 text-white/40'
                            }`}>
                              <span>{opt} {isCorrect && '✅'}</span>
                              <span className="text-[10px] text-white/50">
                                {isMine && isOpp ? `(You & ${opponentName})` : isMine ? '(You)' : isOpp ? `(${opponentName})` : ''}
                              </span>
                            </div>
                          );
                        })}
                        <div className="text-center pt-3">
                          <button
                            onClick={handleTriviaNext}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95"
                          >
                            {gs.questionIndex + 1 >= totalQuestions ? 'See Final Results' : 'Next Question →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── GAME OVER ─── */}
              {isFinished && (
                (() => {
                  const winnerName = gs.winner && gs.winner !== 'draw'
                    ? session?.[gs.winner]?.displayName || (gs.winner === 'player1' ? p1Name : p2Name)
                    : null;

                  return (
                    <div className="text-center py-6">
                      <div className="text-6xl mb-4 animate-bounce">🏆</div>
                      <h3 className="text-xl font-extrabold text-white mb-1">
                        {gs.winner === 'draw'
                          ? "It's a Draw!"
                          : gs.winner === myRole
                            ? '🎉 You Win!'
                            : `${winnerName || opponentName} Wins!`}
                      </h3>
                      {winnerName && (
                        <p className="text-sm text-white/60 mb-1">
                          Winner: <strong>{winnerName}</strong>
                        </p>
                      )}
                      {(selectedGame?.id === 'rps' || selectedGame?.id === 'trivia') && (
                        <p className="text-xs text-indigo-300 mb-4">
                          Final Score: {p1Name} <strong>{gs.p1Score}</strong> — <strong>{gs.p2Score}</strong> {p2Name}
                        </p>
                      )}
                      {selectedGame?.id === 'arena' && (
                        <p className="text-xs text-rose-200/70 mb-4">
                          Blaster Arena ended after {gs.actionCount || 0} combat actions.
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-3 mt-5">
                        <button onClick={handleNewGame} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5">
                          <RefreshCw className="h-4 w-4" /> New Duel
                        </button>
                        <button onClick={handleBackToSelect} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition border border-white/15 active:scale-95">
                          Back to Games
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export function ChatGamesModal(props) {
  const [showBattle, setShowBattle] = useState(props.initialGameId === BATTLE_GAME_ID || props.joinGameId === BATTLE_GAME_ID);

  if (showBattle) {
    return (
      <BeastBuckBattleModal
        onClose={props.onClose}
        currentUser={props.currentUser}
        activeRoomId={props.activeRoomId}
        onSendGameCard={props.onSendGameCard}
        joinMatchId={props.joinSessionId}
      />
    );
  }

  return <LegacyChatGamesModal {...props} onSelectBattle={() => setShowBattle(true)} />;
}
