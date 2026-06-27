import { MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { DriverLogin } from '../components/DriverControl/DriverLogin';
import { DriverRegister } from '../components/DriverControl/DriverRegister';
import { VehicleManage } from '../components/DriverControl/VehicleManage';
import { DriverMap } from '../components/Map/DriverMap';
import { useDriverSession } from '../hooks/useDriverSession';
import { useDriverTracking } from '../hooks/useDriverTracking';

interface DriverControlPageProps {
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
}

export function DriverControlPage({
  showError,
  showSuccess,
}: DriverControlPageProps) {
  const [simCoords, setSimCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [driverPathHistory, setDriverPathHistory] = useState<
    [number, number][]
  >([]);

  const {
    driverSession,
    driverVehicles,
    driverVehicle,
    isEditingVehicle,
    editingVehicleId,
    registerName,
    registerEmail,
    registerPassword,
    loginEmail,
    loginPassword,
    registerLoading,
    loginLoading,
    vehicleType,
    vehicleDetails,
    vehicleLoading,
    driverMode,
    setDriverVehicle,
    setIsEditingVehicle,
    setEditingVehicleId,
    setRegisterName,
    setRegisterEmail,
    setRegisterPassword,
    setLoginEmail,
    setLoginPassword,
    setVehicleType,
    setVehicleDetails,
    setDriverMode,
    logoutDriver,
    handleRegisterDriver,
    handleLoginDriver,
    handleAddVehicle,
    handleUpdateVehicle,
  } = useDriverSession(
    showError,
    showSuccess,
    setSimCoords,
    setDriverPathHistory,
  );

  const { isTrackingActive, handleToggleTracking } = useDriverTracking(
    driverVehicle,
    setDriverVehicle,
    showError,
    showSuccess,
    simCoords,
    setSimCoords,
    driverPathHistory,
    setDriverPathHistory,
  );

  const handleLogout = () => {
    void logoutDriver(isTrackingActive, () => handleToggleTracking(false));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
      {!driverSession ? (
        /* Registration / Login Box */
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl glass-panel-light relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 mb-6 mx-auto">
            <User className="w-6 h-6" />
          </div>

          {/* Switcher Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => setDriverMode('login')}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                driverMode === 'login'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setDriverMode('register')}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                driverMode === 'register'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register New
            </button>
          </div>

          {driverMode === 'register' ? (
            <DriverRegister
              registerName={registerName}
              registerEmail={registerEmail}
              registerPassword={registerPassword}
              registerLoading={registerLoading}
              setRegisterName={setRegisterName}
              setRegisterEmail={setRegisterEmail}
              setRegisterPassword={setRegisterPassword}
              onSubmit={handleRegisterDriver}
            />
          ) : (
            <DriverLogin
              loginEmail={loginEmail}
              loginPassword={loginPassword}
              loginLoading={loginLoading}
              setLoginEmail={setLoginEmail}
              setLoginPassword={setLoginPassword}
              onSubmit={handleLoginDriver}
            />
          )}
        </div>
      ) : (
        /* Driver Workspace Dashboard */
        <div className="w-full space-y-6">
          {/* Top Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 font-bold">
                {driverSession.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-slate-800">
                  {driverSession.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  {driverSession.email} | ID:{' '}
                  {driverSession.driver_id.substring(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-2.5 py-1.5 hover:bg-rose-50/50 text-rose-600 rounded-lg transition-colors border border-rose-200"
            >
              Exit Session
            </button>
          </div>

          {/* Grid Layout: Vehicle Manager and Live Map */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Col: Vehicle Manager */}
            <div className="lg:col-span-2 space-y-6">
              <VehicleManage
                driverVehicles={driverVehicles}
                driverVehicle={driverVehicle}
                setDriverVehicle={setDriverVehicle}
                isEditingVehicle={isEditingVehicle}
                setIsEditingVehicle={setIsEditingVehicle}
                editingVehicleId={editingVehicleId}
                setEditingVehicleId={setEditingVehicleId}
                vehicleType={vehicleType}
                setVehicleType={setVehicleType}
                vehicleDetails={vehicleDetails}
                setVehicleDetails={setVehicleDetails}
                vehicleLoading={vehicleLoading}
                handleAddVehicle={handleAddVehicle}
                handleUpdateVehicle={handleUpdateVehicle}
                isTrackingActive={isTrackingActive}
                handleToggleTracking={handleToggleTracking}
              />
            </div>

            {/* Right Col: Driver Map */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm min-h-100">
              {/* Overlay for tracking status */}
              <div className="absolute top-4 left-4 z-400 px-3.5 py-2 bg-white/95 border border-slate-200 text-slate-700 rounded-xl flex items-center gap-2.5 shadow-sm backdrop-blur-md">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isTrackingActive
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-rose-500'
                  }`}
                ></span>
                <span className="text-xs font-bold">
                  {isTrackingActive
                    ? 'Simulating Coordinates'
                    : 'Tracking Suspended'}
                </span>
              </div>

              {simCoords && (
                <div className="absolute bottom-4 left-4 z-400 px-3 py-1.5 bg-white/90 border border-slate-200 rounded-xl text-[10px] font-mono shadow-sm backdrop-blur-sm text-slate-500">
                  Lat: {simCoords.lat.toFixed(5)}, Lng:{' '}
                  {simCoords.lng.toFixed(5)}
                </div>
              )}

              {!driverVehicle ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-8 text-center min-h-100">
                  <MapPin className="w-10 h-10 mb-2 opacity-50 text-slate-300" />
                  <p className="text-xs max-w-xs">
                    Map and location tracking will be enabled once a vehicle is
                    registered and selected.
                  </p>
                </div>
              ) : (
                <DriverMap
                  simCoords={simCoords}
                  driverVehicle={driverVehicle}
                  driverPathHistory={driverPathHistory}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
