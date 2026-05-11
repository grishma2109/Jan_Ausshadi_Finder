import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, Search, X, MessageSquare, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { checkMedicineStock } from '../services/geminiService';

// Fix Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for selected store or user location
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const storeIcon = (isOpen: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="p-2 rounded-full shadow-lg ${isOpen ? 'bg-emerald-500' : 'bg-red-500'} text-white ring-2 ring-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

interface Store {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  isOpen: boolean;
  phone: string;
  distance?: number; // In meters
}

const INITIAL_STORES: Store[] = [
  {
    id: '1',
    name: "Jan-Aushadhi Kendra #421",
    address: "Near Civil Hospital, Main Road, Sector 4",
    location: { lat: 28.5355, lng: 77.3910 }, // Noida area example
    isOpen: true,
    phone: "011-2345678"
  },
  {
    id: '2',
    name: "Prime Generic Mart",
    address: "Plot 12, Market Square, East Wing",
    location: { lat: 28.5441, lng: 77.3750 },
    isOpen: true,
    phone: "011-8765432"
  },
  {
    id: '3',
    name: "Central Government Store",
    address: "Metro Station Exit, Green Avenue",
    location: { lat: 28.5200, lng: 77.4000 },
    isOpen: false,
    phone: "011-1122334"
  }
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// Helper component to handle map centering
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function StoreLocator() {
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stockModalStore, setStockModalStore] = useState<Store | null>(null);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [stockResult, setStockResult] = useState('');
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Sort stores by distance
          const updatedStores = INITIAL_STORES.map(store => ({
            ...store,
            distance: calculateDistance(latitude, longitude, store.location.lat, store.location.lng)
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setStores(updatedStores);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Location access denied. Using default view.");
        }
      );
    }
  }, []);

  const handleCall = (phone: string) => {
    try {
      window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    } catch (e) {
      alert("This device does not support calling.");
    }
  };

  const handleDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleCheckStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineQuery || !stockModalStore) return;
    
    setIsCheckingStock(true);
    setStockResult('');
    const res = await checkMedicineStock(medicineQuery, stockModalStore.name);
    setStockResult(res);
    setIsCheckingStock(false);
  };

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [28.5355, 77.3910];

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="p-4 space-y-3 z-10 bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kendra Locator</h1>
          <p className="text-slate-500 text-sm">Nearby PM Jan-Aushadhi stores.</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by locality or name..."
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
      </div>

      <div className="h-64 md:h-80 relative bg-slate-100 border-b border-slate-200 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {filteredStores.map(store => (
            <Marker 
              key={store.id} 
              position={[store.location.lat, store.location.lng]} 
              icon={storeIcon(store.isOpen)}
              eventHandlers={{
                click: () => setSelectedStore(store)
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-sm m-0">{store.name}</p>
                  <p className="text-[10px] text-slate-500 m-0">{store.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {!userLocation && !locationError && (
          <div className="absolute top-4 right-4 animate-pulse bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-slate-600 border border-slate-200 cursor-default flex items-center gap-2 z-[1000]">
            <LocateFixed className="w-3 h-3 text-brand-primary" />
            <span>Locating...</span>
          </div>
        )}

        {locationError && (
           <div className="absolute top-4 right-4 bg-red-50 px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-red-600 border border-red-100 cursor-default z-[1000]">
             <span>{locationError}</span>
           </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 pb-24">
        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest px-1">Nearby Results</h3>
        {filteredStores.length === 0 ? (
           <div className="py-12 text-center text-slate-400">
             <p className="text-sm italic">No stores found matching your search.</p>
           </div>
        ) : (
          filteredStores.map((store) => (
            <motion.div
              key={store.id}
              layoutId={store.id}
              onClick={() => setSelectedStore(store)}
              className={`p-4 bg-white border rounded-2xl shadow-sm transition-all cursor-pointer ${
                selectedStore?.id === store.id ? 'border-brand-primary ring-1 ring-brand-primary/20 bg-emerald-50/10' : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-sm">{store.name}</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                  <Navigation className="w-3 h-3" />
                  {store.distance ? `${(store.distance / 1000).toFixed(1)} km` : '...'}
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-1">{store.address}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className={store.isOpen ? "text-emerald-600" : "text-red-500"}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-current" />
                      <span className="text-[10px] font-bold uppercase">{store.isOpen ? "Open Now" : "Closed"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirections(store.location.lat, store.location.lng);
                    }}
                    className="text-slate-400 hover:text-brand-primary transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Route</span>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(store.phone);
                    }}
                    className="text-slate-400 hover:text-brand-primary transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Call</span>
                    </div>
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setStockModalStore(store);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-primary px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  Check Stock
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Window for Selected Store */}
      {selectedStore && (
         <div className="absolute inset-x-0 bottom-24 p-4 z-20">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
               <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-brand-primary" />
                     <span className="text-xs font-bold text-slate-800">Store Details</span>
                  </div>
                  <button onClick={() => setSelectedStore(null)} className="p-1.5 bg-white rounded-full shadow-sm">
                     <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
               </div>
               <div className="p-5">
                  <h2 className="text-lg font-black text-slate-900 mb-1">{selectedStore.name}</h2>
                  <p className="text-xs text-slate-500 mb-4">{selectedStore.address}</p>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => handleDirections(selectedStore.location.lat, selectedStore.location.lng)}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" /> Directions
                      </button>
                      <button 
                        onClick={() => handleCall(selectedStore.phone)}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4 text-brand-primary" /> Call Store
                      </button>
                   </div>
                   <button 
                     onClick={() => setStockModalStore(selectedStore)}
                     className="w-full mt-3 bg-slate-50 border border-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                   >
                     <Search className="w-4 h-4 text-emerald-500" /> View Simulated Stock
                   </button>
               </div>
            </motion.div>
         </div>
      )}

      {/* AI Stock Check Modal */}
      <AnimatePresence>
        {stockModalStore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end p-0 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full rounded-t-[2.5rem] p-8 pb-12 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Check Stock</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stockModalStore.name}</p>
                </div>
                <button onClick={() => {
                  setStockModalStore(null);
                  setStockResult('');
                  setMedicineQuery('');
                }} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleCheckStock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Medicine Name</label>
                  <input 
                    type="text" 
                    required
                    value={medicineQuery}
                    onChange={e => setMedicineQuery(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-primary" 
                  />
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <div className="p-1.5 bg-brand-primary rounded-lg text-white mt-0.5">
                     <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-emerald-800 uppercase tracking-tighter">AI Assistant</p>
                     <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                       I'll query the simulated inventory based on real availability trends for this pharmacy.
                     </p>
                  </div>
                </div>

                {stockResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <p className="text-sm text-slate-700 leading-relaxed italic">{stockResult}</p>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isCheckingStock || !medicineQuery}
                  className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 mt-4 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isCheckingStock ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Checking...
                     </>
                  ) : (
                    'Simulate Stock Check'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

