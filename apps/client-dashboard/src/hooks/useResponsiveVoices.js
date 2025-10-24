import { useEffect, useState } from "react";
export const useResponsiveVoices = () => {
    const [voicesPerPage, setVoicesPerPage] = useState(10);
    useEffect(() => {
        const calculateVoicesPerPage = () => {
            const containerWidth = window.innerWidth - 200; // Restamos padding y sidebar
            const voiceWidth = 84; // 72px + 12px gap
            const calculated = Math.floor(containerWidth / voiceWidth);
            // Asegurar mínimo 6 y máximo 12 voces
            return Math.max(6, Math.min(12, calculated));
        };
        const updateVoicesPerPage = () => {
            setVoicesPerPage(calculateVoicesPerPage());
        };
        // Calcular inicial
        updateVoicesPerPage();
        // Escuchar cambios de tamaño de ventana
        window.addEventListener("resize", updateVoicesPerPage);
        return () => {
            window.removeEventListener("resize", updateVoicesPerPage);
        };
    }, []);
    return voicesPerPage;
};
