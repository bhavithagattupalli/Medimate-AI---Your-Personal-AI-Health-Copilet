import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  Building2,
  Stethoscope,
  Pill,
  Hospital,
  Phone,
  ExternalLink,
  ShieldAlert,
  Compass,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { AppLanguage, Facility } from '../types';
import { fetchNearbyFacilities, geocodeLocationQuery } from '../services/api';

interface NearbyCareViewProps {
  language: AppLanguage;
  preselectedSpecialty?: string | null;
  onOpenEmergencyModal: () => void;
}

export const NearbyCareView: React.FC<NearbyCareViewProps> = ({
  language,
  preselectedSpecialty,
  onOpenEmergencyModal,
}) => {
  // Default coordinates: Hyderabad Health Hub (17.3850, 78.4867) or user GPS
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.4399,
    lng: 78.4983,
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Banjara Hills / Secunderabad, Hyderabad');

  // Manual search input
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ displayName: string; lat: number; lng: number }>>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 14);
    }

    return () => {
      // Keep map instance alive across rerenders
    };
  }, []);

  // Fetch facilities when coordinates or category changes
  useEffect(() => {
    loadFacilities(currentCoords.lat, currentCoords.lng, activeCategory);
  }, [currentCoords, activeCategory]);

  const loadFacilities = async (lat: number, lng: number, cat: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchNearbyFacilities({
        lat,
        lng,
        category: cat,
        radius: 6000,
      });

      setFacilities(res.facilities);
      if (res.facilities.length > 0) {
        setSelectedFacility(res.facilities[0]);
      }
      renderMapMarkers(res.facilities, lat, lng);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      setErrorMessage(err.message || 'Unable to retrieve nearby medical locations.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMapMarkers = (places: Facility[], centerLat: number, centerLng: number) => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // User center marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
            📍
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-blue-600 rotate-45"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const userMarker = L.marker([centerLat, centerLng], { icon: userIcon }).addTo(markersGroupRef.current);
    userMarker.bindPopup(`<b>Your Search Location</b><br/>${locationName}`);

    // Facility markers
    places.forEach((place) => {
      let iconColor = 'bg-teal-600';
      let iconSymbol = '🩺';

      if (place.category === 'hospital') {
        iconColor = 'bg-rose-600';
        iconSymbol = '🏥';
      } else if (place.category === 'pharmacy') {
        iconColor = 'bg-emerald-600';
        iconSymbol = '💊';
      } else if (place.category === 'doctors') {
        iconColor = 'bg-indigo-600';
        iconSymbol = '👨‍⚕️';
      }

      const markerIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer hover:scale-125 transition">
            <div class="w-8 h-8 ${iconColor} rounded-xl border-2 border-white shadow-md flex items-center justify-center text-white text-sm">
              ${iconSymbol}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const m = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(markersGroupRef.current!);

      m.on('click', () => {
        setSelectedFacility(place);
      });

      m.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <b style="font-size: 13px; color: #0f172a;">${place.name}</b><br/>
          <span style="color: #0d9488; text-transform: uppercase; font-size: 10px; font-weight: bold;">${place.category}</span><br/>
          <span style="color: #475569;">${place.address}</span><br/>
          <b style="color: #0284c7;">${place.distanceKm} km away</b><br/>
          <a href="${place.directionsUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: bold; text-decoration: underline; display: inline-block; margin-top: 4px;">Get Directions ↗</a>
        </div>
      `);
    });
  };

  // Browser Geolocation flow (prompt only upon explicit user request)
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please enter your city manually.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setLocationName('Your Current GPS Location');
        mapInstanceRef.current?.setView([latitude, longitude], 14);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setIsLoading(false);
        setErrorMessage('Location permission was denied or timed out. Please type your city/locality in the search box.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual Geocode search
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    setErrorMessage(null);

    try {
      const results = await geocodeLocationQuery(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMessage(`No matching location found for "${searchQuery}". Please check spelling.`);
      }
    } catch (err: any) {
      setErrorMessage('Failed to search location.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocationResult = (loc: { displayName: string; lat: number; lng: number }) => {
    setCurrentCoords({ lat: loc.lat, lng: loc.lng });
    setLocationName(loc.displayName.split(',').slice(0, 2).join(', '));
    setSearchResults([]);
    setSearchQuery('');
    mapInstanceRef.current?.setView([loc.lat, loc.lng], 14);
  };

  const handleQuickCity = (name: string, lat: number, lng: number) => {
    setCurrentCoords({ lat, lng });
    setLocationName(name);
    setSearchResults([]);
    mapInstanceRef.current?.setView([lat, lng], 14);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital':
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'pharmacy':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'doctors':
        return <Stethoscope className="w-4 h-4 text-indigo-600" />;
      default:
        return <Building2 className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <MapPin className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {language === 'te' ? 'సమీప ఆసుపత్రులు, క్లినిక్స్ మరియు మందుల దుకాణాలు' : 'Nearby Healthcare & Emergency Facilities'}
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {language === 'te'
                ? 'మీ ప్రాంతంలోని రియల్ ఓపెన్‌స్ట్రీట్‌మ్యాప్ ఆసుపత్రులు, క్లినిక్‌లు మరియు ఫార్మసీలను కనుగొనండి.'
                : 'Locate verified hospitals, emergency clinics, pharmacies, and physicians with real distance and Google Maps navigation.'}
            </p>
          </div>

          {/* Quick GPS Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestGPS}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4" />
              <span>Use My Current Location</span>
            </button>
            <button
              onClick={onOpenEmergencyModal}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Emergency 112</span>
            </button>
          </div>
        </div>

        {/* Manual Search & Quick Cities */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleManualSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city, town, or locality (e.g. Hyderabad, Vijayawada, Bengaluru, Delhi)..."
                  className="w-full bg-slate-800/90 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingLocation}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
              >
                {isSearchingLocation ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Quick Demo City Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
              <span className="text-[11px] text-slate-400 shrink-0">Hubs:</span>
              <button
                onClick={() => handleQuickCity('Hyderabad, Telangana', 17.3850, 78.4867)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg shrink-0 border border-slate-700"
              >
                Hyderabad
              </button>
              <button
                onClick={() => handleQuickCity('Visakhapatnam, AP', 17.6868, 83.2185)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg shrink-0 border border-slate-700"
              >
                Visakhapatnam
              </button>
              <button
                onClick={() => handleQuickCity('Vijayawada, AP', 16.5062, 80.6480)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg shrink-0 border border-slate-700"
              >
                Vijayawada
              </button>
              <button
                onClick={() => handleQuickCity('Bengaluru, Karnataka', 12.9716, 77.5946)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg shrink-0 border border-slate-700"
              >
                Bengaluru
              </button>
              <button
                onClick={() => handleQuickCity('Delhi NCR', 28.6139, 77.2090)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg shrink-0 border border-slate-700"
              >
                Delhi
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 space-y-1 shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectLocationResult(res)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-xs cursor-pointer text-slate-200 flex items-center justify-between"
                >
                  <span className="truncate">{res.displayName}</span>
                  <span className="text-[10px] text-teal-400 font-bold ml-2">Select</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error or Notice Alert */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Specialty Filter Banner if navigated from Copilot/Report */}
      {preselectedSpecialty && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Prioritizing Facilities for:</span>
            <span className="bg-teal-700 text-white font-semibold px-2 py-0.5 rounded-md">
              {preselectedSpecialty}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">Hospitals with specialized outpatient wings highlighted</span>
        </div>
      )}

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-bold flex items-center gap-1 text-[11px] mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </span>
        {[
          { id: 'all', label: 'All Healthcare Facilities', icon: Building2 },
          { id: 'hospital', label: 'Hospitals & Trauma (24/7)', icon: Hospital },
          { id: 'clinic', label: 'Polyclinics & Diagnostic Centers', icon: Stethoscope },
          { id: 'pharmacy', label: 'Pharmacies & Medical Stores', icon: Pill },
          { id: 'doctors', label: 'Doctor Consulting Rooms', icon: Stethoscope },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Map + Results Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[560px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800 truncate">
                Center: {locationName}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {isLoading ? (
                <span className="flex items-center gap-1 text-teal-600 font-semibold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Querying OpenStreetMap...
                </span>
              ) : (
                <span>{facilities.length} Real Facilities Mapped</span>
              )}
            </div>
          </div>

          {/* Leaflet map container element */}
          <div className="flex-1 w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-md text-[10px] space-y-1">
              <div className="font-bold text-slate-700">Map Legend</div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" /> Hospital / Emergency
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> Clinic / Diagnostics
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Pharmacy / Chemist
              </div>
            </div>
          </div>
        </div>

        {/* Right Facility List Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[560px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Nearby Clinical Facilities ({facilities.length})
            </h3>
            <span className="text-[10px] text-slate-400">Sorted by Proximity</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {facilities.length === 0 && !isLoading && (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold">No medical facilities found within this radius</p>
                <p className="text-[11px] text-slate-400">Try changing the category filter or searching a larger city center.</p>
              </div>
            )}

            {facilities.map((facility) => {
              const isSelected = selectedFacility?.id === facility.id;
              return (
                <div
                  key={facility.id}
                  onClick={() => {
                    setSelectedFacility(facility);
                    mapInstanceRef.current?.setView([facility.lat, facility.lng], 15);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-2 rounded-lg bg-slate-100 text-slate-700">
                        {getCategoryIcon(facility.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {facility.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="capitalize font-semibold text-teal-800">
                            {facility.category}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">
                            {facility.distanceKm} km away
                          </span>
                        </div>
                      </div>
                    </div>

                    {facility.emergency && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                        24/7 ER
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {facility.address}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                    {facility.phone ? (
                      <a
                        href={`tel:${facility.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {facility.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No phone listed</span>
                    )}

                    <a
                      href={facility.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-700 font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
