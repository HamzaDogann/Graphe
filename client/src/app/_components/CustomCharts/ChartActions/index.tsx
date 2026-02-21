"use client";

import React, { memo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChartActionsProps,
  ActiveColorPickerState,
  TypoColorPickerState,
} from "./types";
import { useChartActionLogic } from "./hooks/useChartActionLogic";

import { ActionButtons } from "./components/ActionButtons";
import { PaletteMenu } from "./components/PaletteMenu";
import { TypographyMenu } from "./components/TypographyMenu";
import { ColorPickerTooltip } from "./components/ColorPickerTooltip";
import { ChartInfoTooltip } from "./components/ChartInfoTooltip";

export const ChartActions = memo((props: ChartActionsProps) => {
  const { state, refs, actions } = useChartActionLogic(props);

  const [isMounted, setIsMounted] = useState(false);
  const [activeColorPicker, setActiveColorPicker] =
    useState<ActiveColorPickerState | null>(null);
  const [activeTypoColorPicker, setActiveTypoColorPicker] =
    useState<TypoColorPickerState | null>(null);

  // Track anchor rects for dynamic positioning
  const [paletteAnchorRect, setPaletteAnchorRect] = useState<DOMRect | null>(
    null,
  );
  const [typographyAnchorRect, setTypographyAnchorRect] =
    useState<DOMRect | null>(null);
  const [infoAnchorRect, setInfoAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update anchor rects when menus open
  useEffect(() => {
    if (state.showPaletteMenu && refs.paletteButtonRef.current) {
      setPaletteAnchorRect(
        refs.paletteButtonRef.current.getBoundingClientRect(),
      );
    }
  }, [state.showPaletteMenu, refs.paletteButtonRef]);

  useEffect(() => {
    if (state.showTypographyMenu && refs.typographyButtonRef.current) {
      setTypographyAnchorRect(
        refs.typographyButtonRef.current.getBoundingClientRect(),
      );
    }
  }, [state.showTypographyMenu, refs.typographyButtonRef]);

  useEffect(() => {
    if (state.showInfoTooltip && refs.infoButtonRef.current) {
      setInfoAnchorRect(refs.infoButtonRef.current.getBoundingClientRect());
    }
  }, [state.showInfoTooltip, refs.infoButtonRef]);

  // Update anchor rects on scroll/resize
  useEffect(() => {
    const updatePositions = () => {
      if (state.showPaletteMenu && refs.paletteButtonRef.current) {
        setPaletteAnchorRect(
          refs.paletteButtonRef.current.getBoundingClientRect(),
        );
      }
      if (state.showTypographyMenu && refs.typographyButtonRef.current) {
        setTypographyAnchorRect(
          refs.typographyButtonRef.current.getBoundingClientRect(),
        );
      }
      if (state.showInfoTooltip && refs.infoButtonRef.current) {
        setInfoAnchorRect(refs.infoButtonRef.current.getBoundingClientRect());
      }

      // Update color picker positions
      if (activeColorPicker?.element) {
        setActiveColorPicker((prev) =>
          prev
            ? {
                ...prev,
                rect: prev.element.getBoundingClientRect(),
              }
            : null,
        );
      }
      if (activeTypoColorPicker?.element) {
        setActiveTypoColorPicker((prev) =>
          prev
            ? {
                ...prev,
                rect: prev.element.getBoundingClientRect(),
              }
            : null,
        );
      }
    };

    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [
    state.showPaletteMenu,
    state.showTypographyMenu,
    state.showInfoTooltip,
    refs,
    activeColorPicker,
    activeTypoColorPicker,
  ]);

  // UI Helper handlers that bridge local UI state with business logic
  const handlePaletteClose = () => {
    actions.setShowPaletteMenu(false);
    setActiveColorPicker(null);
    setPaletteAnchorRect(null);
  };

  const handleTypographyClose = () => {
    actions.setShowTypographyMenu(false);
    setActiveTypoColorPicker(null);
    setTypographyAnchorRect(null);
  };

  return (
    <>
      <ActionButtons
        {...props}
        togglePaletteMenu={actions.togglePaletteMenu}
        toggleTypographyMenu={actions.toggleTypographyMenu}
        toggleInfoTooltip={actions.toggleInfoTooltip}
        isPaletteOpen={state.showPaletteMenu}
        isTypographyOpen={state.showTypographyMenu}
        isInfoOpen={state.showInfoTooltip}
        orientation={props.orientation || "vertical"}
        refs={{
          paletteBtn:
            refs.paletteButtonRef as React.RefObject<HTMLButtonElement>,
          typographyBtn:
            refs.typographyButtonRef as React.RefObject<HTMLButtonElement>,
          infoBtn: refs.infoButtonRef as React.RefObject<HTMLButtonElement>,
        }}
      />

      {isMounted && (
        <AnimatePresence>
          {state.showPaletteMenu && paletteAnchorRect && (
            <PaletteMenu
              anchorRect={paletteAnchorRect}
              onClose={handlePaletteClose}
              selectedPalette={state.selectedPalette}
              onPaletteSelect={actions.handlePaletteSelect}
              customColors={state.customColors}
              onCustomColorClick={(index, rect, element) =>
                setActiveColorPicker({ index, rect, element })
              }
              activeColorIndex={activeColorPicker?.index ?? null}
              buttonRef={refs.paletteButtonRef}
              onCloseColorPicker={() => setActiveColorPicker(null)}
            />
          )}
        </AnimatePresence>
      )}

      {isMounted && (
        <AnimatePresence>
          {state.showTypographyMenu &&
            state.typography &&
            typographyAnchorRect && (
              <TypographyMenu
                anchorRect={typographyAnchorRect}
                onClose={handleTypographyClose}
                typography={state.typography}
                onUpdate={actions.handleTypographyUpdate}
                onColorClick={(rect, element) =>
                  setActiveTypoColorPicker({ rect, element })
                }
                isColorPickerOpen={!!activeTypoColorPicker}
                buttonRef={refs.typographyButtonRef}
                onCloseColorPicker={() => setActiveTypoColorPicker(null)}
              />
            )}
        </AnimatePresence>
      )}

      {isMounted && (
        <AnimatePresence>
          {activeColorPicker && (
            <ColorPickerTooltip
              color={state.customColors[activeColorPicker.index]}
              anchorRect={activeColorPicker.rect}
              onClose={() => setActiveColorPicker(null)}
              onChange={(color) =>
                actions.handleCustomColorChange(activeColorPicker.index, color)
              }
            />
          )}
        </AnimatePresence>
      )}

      {isMounted && (
        <AnimatePresence>
          {activeTypoColorPicker && state.typography && (
            <ColorPickerTooltip
              color={state.typography.color}
              anchorRect={activeTypoColorPicker.rect}
              onClose={() => setActiveTypoColorPicker(null)}
              onChange={(color) =>
                actions.handleTypographyUpdate("color", color)
              }
            />
          )}
        </AnimatePresence>
      )}

      {isMounted && (
        <AnimatePresence>
          {state.showInfoTooltip && props.chartInfo && infoAnchorRect && (
            <ChartInfoTooltip
              chartInfo={props.chartInfo}
              anchorRect={infoAnchorRect}
              buttonRef={refs.infoButtonRef}
              onClose={() => {
                actions.setShowInfoTooltip(false);
                setInfoAnchorRect(null);
              }}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
});

ChartActions.displayName = "ChartActions";
