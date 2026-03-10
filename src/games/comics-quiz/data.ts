export interface ComicLevel {
  title: string;
  image: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export function buildComics(baseUrl: string): ComicLevel[] {
  const img = (name: string) => `${baseUrl}images/comics/${name}`;

  return [
    {
      title: "החתול והכדור",
      image: img("cat.png"),
      question: "מה מצא החתול בגינה?",
      options: ["פרח", "כדור", "ספר", "כובע"],
      correctIndex: 1,
    },
    {
      title: "מיה בגן",
      image: img("mia.png"),
      question: "למי נתנה מיה את הפרח?",
      options: ["לחברה", "לאמא שלה", "למורה", "לאבא שלה"],
      correctIndex: 1,
    },
    {
      title: "יום גשום",
      image: img("dani.png"),
      question: "מה לקח דני כשירד גשם?",
      options: ["מעיל", "כובע", "מטריה", "שקית"],
      correctIndex: 2,
    },
  ];
}
