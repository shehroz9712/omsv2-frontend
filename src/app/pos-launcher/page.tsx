'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, Monitor, Download, ExternalLink, Zap, ArrowLeft } from 'lucide-react';

export default function PosLauncherPage() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'windows' | 'desktop'>('desktop');
  const [statusTitle, setStatusTitle] = useState('Checking POS Application...');
  const [statusDesc, setStatusDesc] = useState('Detecting client environment...');
  const [isSpinning, setIsSpinning] = useState(true);

  const apkUrl = '/downloads/QuickOrder-v1.0.0.apk';
  const windowsUrl = '/downloads/QuickOrder-Windows-v1.0.0.zip';
  const webPosUrl = '/pos';

  useEffect(() => {
    // Detect OS & User Agent
    const ua = navigator.userAgent || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isWin = /Windows/i.test(ua);

    if (isMobile) {
      setDeviceType('mobile');
      setStatusTitle('Mobile Client Detected');
      setStatusDesc('Click below to launch QuickOrder app or download APK.');
      setIsSpinning(false);
    } else if (isWin) {
      setDeviceType('windows');
      setStatusTitle('Windows Workstation Detected');
      setStatusDesc('Ready to launch Web POS terminal or download desktop app.');
      setIsSpinning(false);
    } else {
      setDeviceType('desktop');
      setStatusTitle('Desktop Web Client');
      setStatusDesc('Ready to launch browser POS terminal.');
      setIsSpinning(false);
    }
  }, []);

  const triggerMobileApp = () => {
    setStatusTitle('Opening QuickOrder App...');
    setStatusDesc('If installed, app will open automatically.');
    setIsSpinning(true);

    const androidIntentUri = 'intent://pos#Intent;scheme=quickorder;package=com.pos.order.mobile_app;end';
    window.location.href = androidIntentUri;

    setTimeout(() => {
      setStatusTitle('Download APK');
      setStatusDesc('If the app did not open, download and install the APK below.');
      setIsSpinning(false);
    }, 2000);
  };

  const triggerDesktopApp = () => {
    setStatusTitle('Launching Desktop App...');
    setStatusDesc('Attempting custom URI quickorder://pos');
    setIsSpinning(true);
    window.location.href = 'quickorder://pos';

    setTimeout(() => {
      setStatusTitle('Ready');
      setStatusDesc('If desktop client is not installed, use Web POS directly.');
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="relative max-w-md w-full bg-[#111827] border border-[#26334d] rounded-2xl p-8 text-center shadow-2xl overflow-hidden animate-fadeIn">
        {/* Top colored accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

        {/* Brand badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-5">
          <span>OMS by Shehroz</span>
        </div>

        {/* App Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 animate-pulse">
          <Zap className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-2">POS Launcher</h1>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {deviceType === 'mobile'
            ? 'Mobile client detected. Open the installed app or download APK.'
            : 'Desktop workstation detected. Launch Web POS or desktop package.'}
        </p>

        {/* Status Box */}
        <div className="bg-[#0b0f19]/80 border border-[#26334d] rounded-xl p-4 mb-6 flex items-center gap-3.5 text-left">
          <div
            className={`w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 flex-shrink-0 ${
              isSpinning ? 'animate-spin' : '!border-t-emerald-500 !border-emerald-500/30'
            }`}
          />
          <div>
            <h4 className="text-sm font-bold text-white">{statusTitle}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{statusDesc}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {deviceType === 'mobile' ? (
            <>
              <button
                type="button"
                onClick={triggerMobileApp}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Open QuickOrder App
              </button>

              <a
                href={apkUrl}
                download
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Android APK (61.8 MB)
              </a>

              <Link
                href={webPosUrl}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-xl font-semibold text-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Launch Web POS in Browser
              </Link>
            </>
          ) : (
            <>
              <Link
                href={webPosUrl}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Launch Web POS Terminal
              </Link>

              <button
                type="button"
                onClick={triggerDesktopApp}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Open Installed Windows POS
              </button>

              <a
                href={windowsUrl}
                download
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-xl font-semibold text-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Windows Desktop Package (.zip)
              </a>
            </>
          )}
        </div>

        {/* Device Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>
            {deviceType === 'mobile'
              ? 'Mobile Device (Android / iOS)'
              : deviceType === 'windows'
              ? 'Windows Workstation'
              : 'Desktop Web Client'}
          </span>
        </div>

        {/* Return to Admin */}
        <div className="mt-4 pt-4 border-t border-[#26334d]">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
