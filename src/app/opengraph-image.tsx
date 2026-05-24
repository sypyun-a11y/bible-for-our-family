import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "말씀 — 오늘의 한 구절";

async function loadFont(filename: string) {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  return readFile(filePath);
}

export default async function Image() {
  const [pretendardBold, pretendardRegular, notoSerif] = await Promise.all([
    loadFont("Pretendard-Bold.otf"),
    loadFont("Pretendard-Regular.otf"),
    loadFont("NotoSerifKR-SemiBold.otf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 64,
          background:
            "radial-gradient(60% 50% at 30% 0%, rgba(91,117,83,0.22), transparent 65%), radial-gradient(50% 40% at 100% 30%, rgba(245,233,200,0.55), transparent 60%), #f7f4ee",
          fontFamily: "Pretendard",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 56,
            borderRadius: 40,
            background: "linear-gradient(135deg, #ffffff 0%, #f9f5ec 100%)",
            border: "1px solid rgba(91,117,83,0.18)",
            boxShadow: "0 30px 80px -20px rgba(91,117,83,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* corner glow */}
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 320,
              height: 320,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(91,117,83,0.20), transparent 70%)",
              display: "flex",
            }}
          />

          {/* top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: "#78716c",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "#78716c",
                  opacity: 0.4,
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontFamily: "Noto Serif KR",
                  letterSpacing: 6,
                  fontSize: 20,
                  display: "flex",
                }}
              >
                TODAY&apos;S VERSE
              </div>
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "#78716c",
                  opacity: 0.4,
                  display: "flex",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#5b7553",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f7f4ee",
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                말
              </div>
              <div
                style={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: 26,
                  color: "#1c1917",
                  letterSpacing: 1,
                  display: "flex",
                }}
              >
                말씀
              </div>
            </div>
          </div>

          {/* center quote */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "0 40px",
            }}
          >
            <div
              style={{
                fontFamily: "Noto Serif KR",
                fontSize: 160,
                lineHeight: 1,
                color: "#5b7553",
                opacity: 0.35,
                display: "flex",
                marginBottom: -30,
              }}
            >
              &ldquo;
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: "16px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "Noto Serif KR",
                  fontSize: 58,
                  color: "#1c1917",
                  letterSpacing: -1,
                  lineHeight: 1.4,
                  display: "flex",
                }}
              >
                여호와는 나의 목자시니
              </div>
              <div
                style={{
                  fontFamily: "Noto Serif KR",
                  fontSize: 58,
                  color: "#1c1917",
                  letterSpacing: -1,
                  lineHeight: 1.4,
                  display: "flex",
                }}
              >
                내가 부족함이 없으리로다
              </div>
            </div>

            <div
              style={{
                fontFamily: "Noto Serif KR",
                fontSize: 160,
                lineHeight: 0.3,
                color: "#5b7553",
                opacity: 0.35,
                display: "flex",
                marginTop: 8,
              }}
            >
              &rdquo;
            </div>
          </div>

          {/* bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "Pretendard",
                  fontSize: 14,
                  color: "#78716c",
                  letterSpacing: 5,
                  display: "flex",
                }}
              >
                PSALM
              </div>
              <div
                style={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#5b7553",
                  letterSpacing: 1,
                  display: "flex",
                }}
              >
                시편 23 : 1
              </div>
            </div>
            <div
              style={{
                fontFamily: "Noto Serif KR",
                fontSize: 18,
                color: "#78716c",
                display: "flex",
              }}
            >
              조용한 아침에 깃드는 한 구절
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: pretendardBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: pretendardRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Noto Serif KR",
          data: notoSerif,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
