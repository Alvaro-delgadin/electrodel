import { Box, Typography, Paper } from "@mui/material";
import { createClient } from "@/lib/supabaseServer";

export default async function PreguntasFrecuentes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("faqs")
    .single();

  const faqs = data?.faqs || [];

  return (
    <main>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: "2rem 1rem",
          maxWidth: "800px",
          mx: "auto",
          gap: "1.5rem",
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", textAlign: "center", mb: "1rem" }}
        >
          Preguntas Frecuentes
        </Typography>

        {faqs.map((faq, i) => (
          <Paper
            key={i}
            elevation={3}
            sx={{
              p: "1.5rem",
              backgroundColor: "#f9f9f9",
              borderLeft: "5px solid #ec3237",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: "0.5rem" }}>
              {faq.question}
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              {faq.answer}
            </Typography>
          </Paper>
        ))}
      </Box>
    </main>
  );
}
