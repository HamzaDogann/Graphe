import { useState, useRef, useEffect, useCallback } from "react";
import { ChartActionsProps, TypographySettings, PaletteKey } from "../types";
import { COLOR_PALETTES } from "../constants";

export const useChartActionLogic = ({
  currentColors,
  colorCount = 4,
  currentTypography,
  onColorChange,
  onTypographyChange,
}: ChartActionsProps) => {
  // --- States ---
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  
  const [selectedPalette, setSelectedPalette] = useState<PaletteKey>("default");
  const [customColors, setCustomColors] = useState<string[]>([]);
  
  const [typography, setTypography] = useState<TypographySettings | undefined>(currentTypography);
  
  // Element Refs for positioning
  const paletteButtonRef = useRef<HTMLButtonElement>(null);
  const typographyButtonRef = useRef<HTMLButtonElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  // Debounce Refs
  const colorDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const typographyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // --- Sync Props to State ---
  useEffect(() => {
    if (currentColors) {
      setCustomColors(currentColors.slice(0, colorCount));
    }
  }, [currentColors, colorCount]);

  useEffect(() => {
    if (currentTypography) {
      setTypography(currentTypography);
    }
  }, [currentTypography]);

  // --- Handlers ---
  
  const handlePaletteSelect = useCallback((key: PaletteKey) => {
    setSelectedPalette(key);
    const newColors = COLOR_PALETTES[key].slice(0, colorCount);
    setCustomColors(newColors);
    
    // Debounce Logic
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    colorDebounceRef.current = setTimeout(() => {
      onColorChange?.(newColors);
    }, 100);
  }, [colorCount, onColorChange]);

  const handleCustomColorChange = useCallback((index: number, color: string) => {
    setCustomColors((prev) => {
      const newColors = [...prev];
      newColors[index] = color;
      
      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => {
        onColorChange?.(newColors);
      }, 100);
      
      return newColors;
    });
  }, [onColorChange]);

  const handleTypographyUpdate = useCallback((key: keyof TypographySettings, value: any) => {
    setTypography((prev) => {
      if (!prev) return prev;
      const newTypography = { ...prev, [key]: value };
      
      if (typographyDebounceRef.current) clearTimeout(typographyDebounceRef.current);
      typographyDebounceRef.current = setTimeout(() => {
        onTypographyChange?.(newTypography);
      }, 100);
      
      return newTypography;
    });
  }, [onTypographyChange]);

  const togglePaletteMenu = useCallback(() => {
    setShowPaletteMenu((prev) => !prev);
    setShowTypographyMenu(false);
    setShowInfoTooltip(false);
  }, []);

  const toggleTypographyMenu = useCallback(() => {
    setShowTypographyMenu((prev) => !prev);
    setShowPaletteMenu(false);
    setShowInfoTooltip(false);
  }, []);

  const toggleInfoTooltip = useCallback(() => {
    setShowInfoTooltip((prev) => !prev);
    setShowPaletteMenu(false);
    setShowTypographyMenu(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    setShowPaletteMenu(false);
    setShowTypographyMenu(false);
    setShowInfoTooltip(false);
  }, []);

  return {
    state: {
      showPaletteMenu,
      showTypographyMenu,
      showInfoTooltip,
      selectedPalette,
      customColors,
      typography,
    },
    refs: {
      paletteButtonRef,
      typographyButtonRef,
      infoButtonRef,
    },
    actions: {
      setShowPaletteMenu,
      setShowTypographyMenu,
      setShowInfoTooltip,
      handlePaletteSelect,
      handleCustomColorChange,
      handleTypographyUpdate,
      togglePaletteMenu,
      toggleTypographyMenu,
      toggleInfoTooltip,
      closeAllMenus
    }
  };
};