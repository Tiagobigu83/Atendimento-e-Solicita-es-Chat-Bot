import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Info } from 'lucide-react';

// Fix for default marker icon in leaflet
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Request {
  id: number;
  protocol: string;
  type: string;
  status: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface Ecopoint {
  id: number;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

export default function MapAnalyzer() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [ecopoints, setEcopoints] = useState<Ecopoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Ananindeua center
  const center: [number, number] = [-1.3655, -48.3744];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, ecoRes] = await Promise.all([
          window.fetch('/api/requests'),
          window.fetch('/api/ecopoints')
        ]);
        
        const reqData = await reqRes.json();
        const ecoData = await ecoRes.json();

        // Mock coordinates for demo since we don't have a geocoder
        const reqWithCoords = reqData.map((r: any) => ({
          ...r,
          lat: center[0] + (Math.random() - 0.5) * 0.05,
          lng: center[1] + (Math.random() - 0.5) * 0.05
        }));

        const ecoWithCoords = ecoData.map((e: any) => ({
          ...e,
          lat: center[0] + (Math.random() - 0.5) * 0.03,
          lng: center[1] + (Math.random() - 0.5) * 0.03
        }));

        setRequests(reqWithCoords);
        setEcopoints(ecoWithCoords);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seurb-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analisador de Mapa</h2>
          <p className="text-slate-500">Visualize a distribuição geográfica das solicitações e ecopontos em Ananindeua</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Solicitações</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-seurb-green"></div>
            <span>Ecopontos</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[600px] relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {requests.map((req) => (
            <Circle
              key={`req-${req.id}`}
              center={[req.lat!, req.lng!]}
              pathOptions={{ 
                color: req.status === 'Concluído' ? '#10b981' : '#ef4444',
                fillColor: req.status === 'Concluído' ? '#10b981' : '#ef4444',
                fillOpacity: 0.4 
              }}
              radius={200}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-slate-900">{req.protocol}</h3>
                  <p className="text-xs text-slate-500 mb-2">{req.type}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'Em rota' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs">{req.address}</p>
                </div>
              </Popup>
            </Circle>
          ))}

          {ecopoints.map((eco) => (
            <Marker 
              key={`eco-${eco.id}`} 
              position={[eco.lat!, eco.lng!]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-seurb-green">{eco.name}</h3>
                  <p className="text-xs text-slate-500 mb-1">Ecoponto / PEV</p>
                  <p className="text-xs">{eco.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-50 p-2 rounded-lg">
              <Info className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900">Pontos Críticos</h3>
          </div>
          <p className="text-sm text-slate-500">
            Áreas com maior concentração de solicitações pendentes. Recomenda-se reforço na coleta nestas regiões.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-seurb-green-light p-2 rounded-lg">
              <Info className="w-5 h-5 text-seurb-green" />
            </div>
            <h3 className="font-bold text-slate-900">Cobertura Ecopontos</h3>
          </div>
          <p className="text-sm text-slate-500">
            A distribuição atual de ecopontos atende 65% da área urbana. Planejamento de 2 novas unidades em andamento.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-900">Otimização de Rotas</h3>
          </div>
          <p className="text-sm text-slate-500">
            Integração com GPS dos caminhões permite visualizar o deslocamento em tempo real (Funcionalidade Premium).
          </p>
        </div>
      </div>
    </div>
  );
}
