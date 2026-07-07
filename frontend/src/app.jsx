import { useEffect, useRef, useState } from "react";
import axios from "axios";

function GrainBackground() {

  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    const dpr =
      window.devicePixelRatio || 1;

    function draw() {

      const W = window.innerWidth;

      const H = window.innerHeight;

      // -----------------------------------
      // RESET TRANSFORM (IMPORTANT FIX)
      // -----------------------------------

      ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );

      // -----------------------------------
      // RESIZE CANVAS
      // -----------------------------------

      canvas.width = W * dpr;

      canvas.height = H * dpr;

      canvas.style.width = W + "px";

      canvas.style.height = H + "px";

      ctx.scale(dpr, dpr);

      // -----------------------------------
      // BASE BLACK BACKGROUND
      // -----------------------------------

      ctx.fillStyle = "#000";

      ctx.fillRect(0, 0, W, H);

      // -----------------------------------
      // OUTER BLUE GLOW
      // -----------------------------------

      const spot =
        ctx.createRadialGradient(
          W / 2,
          -H * 0.05,
          0,
          W / 2,
          -H * 0.05,
          H * 2.2
        );

      spot.addColorStop(
        0,
        "rgba(30,80,200,0.55)"
      );

      spot.addColorStop(
        0.25,
        "rgba(15,50,160,0.30)"
      );

      spot.addColorStop(
        0.5,
        "rgba(5,20,80,0.12)"
      );

      spot.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = spot;

      ctx.fillRect(0, 0, W, H);

      // -----------------------------------
      // INNER BLUE CORE
      // -----------------------------------

      const core =
        ctx.createRadialGradient(
          W / 2,
          H * 0.02,
          0,
          W / 2,
          -H * 0.05,
          H * 1.0
        );

      core.addColorStop(
        0,
        "rgba(80,140,255,0.45)"
      );

      core.addColorStop(
        0.4,
        "rgba(40,90,220,0.18)"
      );

      core.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = core;

      ctx.fillRect(0, 0, W, H);

      // -----------------------------------
      // GRAIN EFFECT
      // -----------------------------------

      const img =
        ctx.getImageData(
          0,
          0,
          W * dpr,
          H * dpr
        );

      for (
        let i = 0;
        i < img.data.length;
        i += 4
      ) {

        const n =
          (Math.random() - 0.5) * 28;

        img.data[i] =
          Math.min(
            255,
            Math.max(
              0,
              img.data[i] + n
            )
          );

        img.data[i + 1] =
          Math.min(
            255,
            Math.max(
              0,
              img.data[i + 1] + n
            )
          );

        img.data[i + 2] =
          Math.min(
            255,
            Math.max(
              0,
              img.data[i + 2] + n
            )
          );
      }

      ctx.putImageData(img, 0, 0);

      // -----------------------------------
      // BOTTOM FADE
      // -----------------------------------

      const fade =
        ctx.createLinearGradient(
          0,
          H * 0.88,
          0,
          H
        );

      fade.addColorStop(
        0,
        "rgba(0,0,0,0)"
      );

      fade.addColorStop(
        1,
        "rgba(0,0,0,1)"
      );

      ctx.fillStyle = fade;

      ctx.fillRect(0, 0, W, H);
    }

    draw();

    window.addEventListener(
      "resize",
      draw
    );

    // -----------------------------------
    // SCROLL FADE EFFECT
    // -----------------------------------

    const onScroll = () => {

      canvas.style.opacity =
        Math.max(
          0,
          1 -
            window.scrollY /
              (window.innerHeight * 0.5)
        );
    };

    window.addEventListener(
      "scroll",
      onScroll
    );

    return () => {

      window.removeEventListener(
        "resize",
        draw
      );

      window.removeEventListener(
        "scroll",
        onScroll
      );
    };

  }, []);

  return (

    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />

  );
}

function App() {

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  // ----------------------------------------
  // HANDLE FILE SELECTION
  // ----------------------------------------

  const handleFileChange = (event) => {

    setSelectedFile(
      event.target.files[0]
    );
  };

  // ----------------------------------------
  // HANDLE FILE UPLOAD
  // ----------------------------------------

  const handleUpload = async () => {

    if (!selectedFile) {

      alert(
        "Please select a resume file."
      );

      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      setResult(response.data);

    } catch (error) {

      console.error(error);

      alert("Upload failed.");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-black text-white">

      <GrainBackground />

      {/* Navbar */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
        }}
        className="w-full bg-transparent"
      >

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-2xl font-bold text-white">
            AI Resume Analyzer
          </h1>

          <button className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 transition border border-gray-700 text-white">

            Upload Resume

          </button>

        </div>

      </nav>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="max-w-7xl mx-auto px-6 text-center"
      >

        <h1 className="text-6xl font-bold leading-tight tracking-tight text-white">

          Optimize Your Resume

          <br />

          <span className="text-blue-400">
            With AI
          </span>

        </h1>

        <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">

          Upload your resume and get ATS analysis,
          skill detection, missing skills,
          AI suggestions, and interview questions instantly.

        </p>

        {/* Upload Box */}
        <div
          className="mt-12 w-full max-w-2xl rounded-3xl border border-gray-800 p-10 backdrop-blur-md"
          style={{
            background:
              "rgba(255,255,255,0.03)",
          }}
        >

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-gray-300"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-8 px-8 py-4 rounded-2xl bg-white text-black hover:bg-gray-200 transition text-lg font-semibold shadow-lg"
          >

            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}

          </button>

        </div>

      </section>

      {/* Features */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
        }}
        className="max-w-7xl mx-auto px-6 pb-24"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            {
              title: "ATS Score",
              desc:
                "Get an AI-powered ATS compatibility score instantly.",
            },
            {
              title: "Skill Detection",
              desc:
                "Detect technical skills from your resume automatically.",
            },
            {
              title: "Missing Skills",
              desc:
                "Find important missing skills recruiters expect.",
            },
            {
              title: "Interview Prep",
              desc:
                "Receive AI-generated interview questions instantly.",
            },
          ].map((card) => (

            <div
              key={card.title}
              className="rounded-2xl border border-gray-800 p-6"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />

              <h2 className="text-xl font-semibold text-white mb-2">

                {card.title}

              </h2>

              <p className="text-gray-400">

                {card.desc}

              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Result Dashboard */}
      {result && (

        <section
          style={{
            position: "relative",
            zIndex: 10,
          }}
          className="max-w-7xl mx-auto px-6 pb-24"
        >

          <div className="space-y-8">

            {/* ATS Score */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                ATS Score

              </h2>

              <div className="flex items-center gap-6">

                <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">

                  {
                    result.analysis.analysis
                      .ats_score
                  }

                </div>

                <div>

                  <p className="text-gray-300 text-lg">

                    AI-generated ATS compatibility score
                    based on your resume quality,
                    skills, and overall structure.

                  </p>

                </div>

              </div>

            </div>

            {/* Technical Skills */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Technical Skills

              </h2>

              <div className="flex flex-wrap gap-4">

                {result.analysis.analysis.technical_skills.map(
                  (skill, index) => (

                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300"
                    >

                      {skill}

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Missing Skills */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Missing Skills

              </h2>

              <div className="flex flex-wrap gap-4">

                {result.analysis.analysis.missing_skills.map(
                  (skill, index) => (

                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300"
                    >

                      {skill}

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Strengths */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Strengths

              </h2>

              <div className="space-y-4">

                {result.analysis.analysis.strengths.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-200"
                    >

                      {item}

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Weaknesses */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Weaknesses

              </h2>

              <div className="space-y-4">

                {result.analysis.analysis.weaknesses.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200"
                    >

                      {item}

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Suggestions */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Suggestions

              </h2>

              <div className="space-y-4">

                {result.analysis.analysis.suggestions.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-200"
                    >

                      {item}

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Interview Questions */}
            <div
              className="rounded-3xl border border-gray-800 p-8"
              style={{
                background:
                  "rgba(255,255,255,0.03)",
              }}
            >

              <h2 className="text-3xl font-bold mb-6">

                Interview Questions

              </h2>

              <div className="space-y-4">

                {result.analysis.analysis.interview_questions.map(
                  (question, index) => (

                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-100"
                    >

                      {question}

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

      )}

    </div>
  );
}

export default App;