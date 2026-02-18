import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Wand2, Copy, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function CorrecaoRapida() {
  const navigate = useNavigate();
  const [textoBruto, setTextoBruto] = useState('');
  const [textoCorrigido, setTextoCorrigido] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCorrigir = async () => {
    if (!textoBruto.trim()) {
        setMessage('Digite algum texto para corrigir.');
        return;
    }
    
    setLoading(true);
    setMessage('');
    setTextoCorrigido(''); // Limpa anterior

    try {
      const response = await api.post('/analisador/processar-relatorio', {
        relatorio_bruto: textoBruto
      });
      
      const { relatorio_processado } = response.data.data || response.data; // Tenta pegar de data.data ou direto, por garantia
      setTextoCorrigido(relatorio_processado);
      setMessage('Texto corrigido pela IA!');
    } catch (error) {
      console.error('Erro na correção:', error);
      setMessage('Erro ao corrigir texto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textoCorrigido);
    setMessage('Copiado!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(textoCorrigido);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Correção Mágica ✨</h1>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${message.includes('Erro') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            <CheckCircle className="h-4 w-4" /> {message}
          </div>
        )}

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texto Original</label>
            <textarea
                className="w-full p-4 h-32 resize-none border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={textoBruto}
                onChange={(e) => setTextoBruto(e.target.value)}
                placeholder="Cole ou digite o texto bagunçado aqui..."
                disabled={loading}
            />
        </div>

        <Button 
            onClick={handleCorrigir} 
            isLoading={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
        >
            <Wand2 className="mr-2 h-4 w-4" /> Corrigir com IA
        </Button>

        {textoCorrigido && (
            <div className="flex-1 flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Wand2 className="h-3 w-3" /> Resultado
                </label>
                <div className="bg-white p-1 rounded-xl shadow-sm border border-green-200 flex-1 flex flex-col">
                    <textarea
                        className="flex-1 w-full p-4 resize-none focus:outline-none text-base leading-relaxed text-gray-800 rounded-xl bg-green-50/30"
                        value={textoCorrigido}
                        onChange={(e) => setTextoCorrigido(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  <Button variant="outline" onClick={handleCopy} className="flex flex-col h-auto py-3 gap-1 bg-white border-gray-200">
                    <Copy className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-normal">Copiar</span>
                  </Button>
                  <Button variant="primary" onClick={handleWhatsApp} className="flex flex-col h-auto py-3 gap-1 bg-green-600 hover:bg-green-700 border-none">
                    <MessageCircle className="h-5 w-5 text-white" />
                    <span className="text-xs font-normal">WhatsApp</span>
                  </Button>
                </div>
            </div>
        )}
        
        <div className="text-center text-xs text-gray-300 mt-auto py-2">
          Luis Royo Tech
        </div>
      </main>
    </div>
  );
}
