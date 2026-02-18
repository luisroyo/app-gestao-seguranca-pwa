import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Save, Copy, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

interface OcorrenciaDetalhe {
  id: number;
  relatorio_final: string;
  condominio: string;
  tipo: string;
  data_hora_ocorrencia: string;
}

export default function OcorrenciaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhe | null>(null);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/ocorrencias/${id}`);
      const data = response.data.data.ocorrencia;
      setOcorrencia(data);
      setTexto(data.relatorio_final || '');
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setMessage('Erro ao carregar detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/ocorrencias/${id}`, {
        relatorio_final: texto
      });
      setMessage('Salvo com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(texto);
    setMessage('Copiado para área de transferência!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(texto);
    // Deep link padrão do WhatsApp
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!ocorrencia) return <div className="p-8 text-center">Não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate text-gray-900">{ocorrencia.condominio}</h1>
          <p className="text-xs text-gray-500 truncate">{ocorrencia.tipo}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving} className="text-blue-600">
          <Save className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {message && (
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {message}
          </div>
        )}

        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
          <textarea
            className="flex-1 w-full p-4 resize-none focus:outline-none text-base leading-relaxed text-gray-800 rounded-xl"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite o relatório aqui..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button variant="outline" onClick={handleCopy} className="flex flex-col h-auto py-3 gap-1 bg-white border-gray-200">
            <Copy className="h-5 w-5 text-gray-600" />
            <span className="text-xs font-normal">Copiar</span>
          </Button>
          <Button variant="primary" onClick={handleWhatsApp} className="flex flex-col h-auto py-3 gap-1 bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-5 w-5 text-white" />
            <span className="text-xs font-normal">WhatsApp</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
