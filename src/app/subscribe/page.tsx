import { redirect } from "next/navigation";

// Alte "Get access"-Seite entfällt – das Angebot steht jetzt auf der Startseite.
export default function SubscribeRedirect() {
  redirect("/");
}
