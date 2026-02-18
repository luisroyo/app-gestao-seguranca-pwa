import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Wand2, Copy, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function CorrecaoRapida() {
  const navigate = useNavigate();
  // Inicialização lazy do estado lendo direto do localStorage para evitar race condition
  const [textoBruto, setTextoBruto] = useState(() => localStorage.getItem('correcao_bruto') || '');
  const [textoCorrigido, setTextoCorrigido] = useState(() => localStorage.getItem('correcao_corrigido') || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [condominios, setCondominios] = useState<{id: number, nome: string}[]>([]);
  const [tipos, setTipos] = useState<{id: number, nome: string}[]>([]);
  const [selectedCondominio, setSelectedCondominio] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Ref para controlar a primeira renderização e não limpar o estado salvo
  const isFirstRender = useRef(true);

  // Limpar o resultado se o texto original for alterado (para evitar salvar dados inconsistentes)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (textoCorrigido) {
      setTextoCorrigido('');
    }
  }, [textoBruto]);

  // Persistência: Salvar no localStorage sempre que mudar
  // O carregamento inicial já foi feito no useState acima

  useEffect(() => {
    localStorage.setItem('correcao_bruto', textoBruto);
  }, [textoBruto]);

  useEffect(() => {
    localStorage.setItem('correcao_corrigido', textoCorrigido);
  }, [textoCorrigido]);

  // Carregar dados para o modal
  useEffect(() => {
    if (showSaveModal) {
      fetchDadosModal();
    }
  }, [showSaveModal]);

  const fetchDadosModal = async () => {
    try {
      const [condRes, tiposRes] = await Promise.all([
        api.get('/ocorrencias/condominios'),
        api.get('/ocorrencias/tipos')
      ]);
      setCondominios(condRes.data.data.condominios || []);
      setTipos(tiposRes.data.data.tipos || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage('Erro ao carregar opções para salvar.');
    }
  };

  const handleCorrigir = async () => {
    if (!textoBruto.trim()) {
        setMessage('Digite algum texto para corrigir.');
        return;
    }
    
    setLoading(true);
    setMessage('');
    setTextoCorrigido('');

    try {
      const response = await api.post('/analisador/processar-relatorio', {
        relatorio_bruto: textoBruto
      });
      
      const { relatorio_processado } = response.data.data || response.data;
      setTextoCorrigido(relatorio_processado);
      setMessage('Texto corrigido pela IA!');
    } catch (error) {
      console.error('Erro na correção:', error);
      setMessage('Erro ao corrigir texto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    if (window.confirm('Tem certeza que deseja limpar tudo?')) {
      setTextoBruto('');
      setTextoCorrigido('');
      localStorage.removeItem('correcao_bruto');
      localStorage.removeItem('correcao_corrigido');
      setMessage('Tudo limpo!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSalvar = async () => {
    if (!selectedCondominio || !selectedTipo) {
      setMessage('Selecione o condomínio e o tipo.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/ocorrencias', {
        relatorio_final: textoCorrigido,
        condominio_id: parseInt(selectedCondominio),
        ocorrencia_tipo_id: parseInt(selectedTipo),
        status: 'Registrada',
        origem: 'app_mobile' // Opcional, para rastreio se o backend suportar
      });
      
      setMessage('Ocorrência salva com sucesso!');
      setShowSaveModal(false);
      // Limpar após salvar? Opcional. Vamos manter por segurança.
      // handleLimpar(); 
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('Erro ao salvar ocorrência.');
    } finally {
      setSaving(false);
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
        <Button variant="ghost" size="sm" onClick={handleLimpar} className="text-red-500 text-xs">
          Limpar
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${message.includes('Erro') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            <CheckCircle className="h-4 w-4" /> {message}
          </div>
        )}

        {/* Modal de Salvar */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <h3 className="text-lg font-bold">Salvar Ocorrência</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Condomínio</label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white"
                  value={selectedCondominio}
                  onChange={(e) => setSelectedCondominio(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {condominios.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white"
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowSaveModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 text-white" 
                  onClick={handleSalvar}
                  isLoading={saving}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texto Original</label>
            <textarea
                className="w-full p-4 h-32 resize-none border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={textoBruto}
                onChange={(e) => {
                  setTextoBruto(e.target.value);
                  if (textoCorrigido) setTextoCorrigido('');
                }}
                placeholder="Cole ou digite o texto bagunçado aqui..."
                disabled={loading}
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
              onClick={handleCorrigir} 
              isLoading={loading}
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md ${!textoCorrigido ? 'col-span-2' : ''}`}
          >
              <Wand2 className="mr-2 h-4 w-4" /> Corrigir
          </Button>

          {(textoCorrigido) && (
             <Button 
               variant="outline"
               onClick={() => setShowSaveModal(true)}
               className="border-green-600 text-green-700 hover:bg-green-50"
             >
               Salvar no Sistema
             </Button>
          )}
        </div>

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
