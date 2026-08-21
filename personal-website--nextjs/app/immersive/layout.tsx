import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import CanvasBackground from "@/components/CanvasBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import BlackHoleIntro from "@/components/intro/BlackHoleIntro";

export default function ImmersiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BlackHoleIntro />
      <ThemeProvider>
        <SmoothScroll>
          <CustomCursor />
          <CanvasBackground />
          {children}
        </SmoothScroll>
      </ThemeProvider>
    </>
  );
}
