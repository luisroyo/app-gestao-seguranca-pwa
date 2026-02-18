import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { LogOut, RefreshCw, FileText, ChevronRight, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Ocorrencia {
  id: number;
  tipo: string;
  condominio: string;
  data_hora_ocorrencia: string;
  status: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOcorrencias = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ocorrencias');
      setOcorrencias(response.data.data.ocorrencias);
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Relatórios</h1>
          <p className="text-xs text-gray-500">Olá, {user?.username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchOcorrencias} className="p-2">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="p-2">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-4">
        {loading && ocorrencias.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Carregando...</div>
        ) : ocorrencias.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Nenhum relatório encontrado.</div>
        ) : (
          <div className="space-y-3">
            {ocorrencias.map((ocr) => (
              <div 
                key={ocr.id}
                onClick={() => navigate(`/ocorrencia/${ocr.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ocr.status)}`}>
                      {ocr.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(ocr.data_hora_ocorrencia)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{ocr.condominio}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {ocr.tipo}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center text-xs text-gray-300 py-4 pb-20">
          Luis Royo Tech © 2026
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button 
            onClick={() => navigate('/correcao-rapida')} 
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform flex items-center justify-center p-0"
        >
            <Wand2 className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
