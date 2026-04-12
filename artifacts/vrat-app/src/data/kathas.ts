export interface KathaChapter {
  title: string;
  body: string;
}

export interface ChapteredKatha {
  chapters: KathaChapter[];
  phalaShruti?: string;
}

export const VRAT_KATHAS: Record<string, string | ChapteredKatha> = {
  ekadashi: `Long ago a demon named Mura terrorised the heavens. Lord Vishnu fought him for a thousand years and grew tired. He rested in a cave where a beautiful maiden emerged from his energy and slew the demon. Vishnu named her Ekadashi and blessed her — whoever fasts on the eleventh day of the lunar fortnight shall be freed from sin and granted moksha. This is why we honour Ekadashi twice every month.`,

  "ekadashi-nirjala": `The Pandava Bhima was known for his enormous appetite and found it impossible to fast on all 24 Ekadashis. He approached the sage Vyasa who told him of Nirjala Ekadashi — one strict fast without food or water that carries the merit of all 24 Ekadashis combined. Bhima observed it faithfully. This is why Nirjala Ekadashi is also called Bhimseni Ekadashi and is considered the most powerful fast in the Vaishnava calendar.`,

  pradosh: `Once all the gods and demons churned the cosmic ocean to find amrit — the nectar of immortality. But first came the most deadly poison, halahala, which threatened to destroy all creation. Lord Shiva stepped forward and swallowed it, holding it in his throat which turned blue. The gods were saved at the twilight hour — Pradosh Kaal. We fast and pray at this time each fortnight to honour Shiva's sacrifice.`,

  navratri: `The demon Mahishasura had received a boon that no man or god could kill him. Growing powerful, he attacked the heavens and drove the gods from their kingdom. The gods united their divine energies and from that combined shakti emerged Goddess Durga — a warrior goddess of incomparable power. For nine days she battled Mahishasura and on the tenth day, Dussehra, she slew him. We celebrate these nine days honouring the divine feminine power that protects all creation.`,

  "karva-chauth": `Savitri was a devoted wife whose husband Satyavan was fated to die young. When Yama the god of death came to take Satyavan, Savitri followed him, refusing to return home without her husband. Impressed by her devotion and wisdom, she defeated Yama with her answers and won back her husband's life. Women fast from sunrise to moonrise on Karva Chauth honouring this love and praying for the long life of their husbands.`,

  "maha-shivratri": `On this night Lord Shiva and Goddess Parvati were married. It is also the night Shiva performed the Tandava — his cosmic dance that sustains the rhythm of the universe. Devotees stay awake all night as Shiva himself is believed to be present and accessible in a way he is at no other time of year. The four prahar pujas through the night mirror the four watches of this sacred night.`,

  janmashtami: `In the prison of the tyrant Kansa in Mathura, at the stroke of midnight in a thunderstorm, the eighth child of Devaki and Vasudeva was born. This child was Lord Krishna — an avatar of Vishnu who had descended to Earth to restore dharma. His father Vasudeva carried him through the flooded Yamuna river to safety in Gokul that very night. We fast until midnight and celebrate his birth with joy, bhajans, and the breaking of the dahi handi.`,

  "vat-savitri": `The devoted Savitri chose to marry Satyavan knowing he would die within a year. When Yama came to claim him, Savitri followed without fear. Three times Yama offered her a boon asking her not to follow further. Each time she asked for something that ultimately required Satyavan to be alive. Defeated by her wisdom and love, Yama returned her husband. Women tie thread around the banyan tree — the tree of eternal life — and pray for their husband's longevity.`,

  sankashti: `Once all the gods were competing to see who could circle the universe first. Lord Kartikeya mounted his peacock and set off immediately. But Ganesha simply walked around his parents Shiva and Parvati — for they are his entire universe. Pleased by this wisdom, Ganesha was declared the winner. We fast on Chaturthi and worship Ganesha who removes all obstacles with his intelligence rather than his strength.`,

  purnima: {
    chapters: [
      {
        title: "Chapter 1 — Origin of the Vrat",
        body: "Narada Muni travels to Earth and sees humans suffering greatly in Kalyug. He visits Lord Vishnu and asks how people can find relief from their misery. Lord Vishnu reveals the Satyanarayan Vrat — the simplest path to peace and prosperity — and instructs Narada to share it with the world.",
      },
      {
        title: "Chapter 2 — The Poor Brahmin and the Woodcutter",
        body: "Lord Vishnu appears as an old Brahmin and instructs a poor Brahmin to perform the Satyanarayan puja. After doing so faithfully, the Brahmin overcomes all his obstacles and finds joy. A woodcutter witnesses this transformation and performs the puja himself — receiving the same blessings and abundance.",
      },
      {
        title: "Chapter 3 — The Merchant who broke his vow",
        body: "A wealthy merchant promises to perform the Satyanarayan puja after his child is born but repeatedly delays and forgets his vow. The Lord holds him accountable — the merchant is falsely accused and imprisoned. His devoted wife performs the puja with sincerity, the Lord shows mercy, and the merchant is freed.",
      },
      {
        title: "Chapter 4 — The importance of Prasad",
        body: "Continuing from Chapter 3 — the merchant's wife and daughter rush to greet him at the dockyard without first accepting the prasad. The Lord is displeased and the ship sinks. It rises again only when the wife and daughter humbly accept and eat the prasad — teaching that prasad must never be disrespected or refused.",
      },
      {
        title: "Chapter 5 — King Tungadhwaj and the Phala Shruti",
        body: "A king named Tungadhwaj goes hunting in the forest and comes upon cowherds performing Satyanarayan puja with great devotion. Out of pride and arrogance he neither joins them nor bows to the Lord. When offered prasad he refuses and walks away. Upon returning to his kingdom he finds all his sons dead and his wealth gone — the consequence of disrespecting the Lord's prasad. Realising his mistake he returns to the cowherds, humbly performs the puja and accepts the prasad with full devotion. All is restored. He attains happiness in this life and moksha after death.",
      },
    ],
    phalaShruti: "Lord Vishnu declares: Whoever hears or reads this Katha with devotion shall be freed from all sins. One who is childless shall be blessed with children. One who is without wealth shall gain prosperity. One who is imprisoned shall be freed. One who is fearful shall be liberated from fear. A widow who observes this vrat with devotion shall be blessed with a good husband in her next birth. One who performs this puja with a pure heart shall enjoy all earthly pleasures and attain moksha after death. The person who observes this great and rare fast shall, by the grace of Lord Satyanarayana, never face shortage of wealth or grain. Jai Lakshmi Ramana Shri Satyanarayan Swami Ki Jai.",
  },
};

export function getVratKatha(id: string): string | ChapteredKatha | undefined {
  if (id === "ekadashi-jun-1") return VRAT_KATHAS["ekadashi-nirjala"];
  if (id.startsWith("ekadashi")) return VRAT_KATHAS["ekadashi"];
  if (id.startsWith("pradosh")) return VRAT_KATHAS["pradosh"];
  if (id.startsWith("navratri")) return VRAT_KATHAS["navratri"];
  if (id === "karva-chauth") return VRAT_KATHAS["karva-chauth"];
  if (id === "maha-shivratri") return VRAT_KATHAS["maha-shivratri"];
  if (id === "janmashtami") return VRAT_KATHAS["janmashtami"];
  if (id === "vat-savitri") return VRAT_KATHAS["vat-savitri"];
  if (id.startsWith("sankashti")) return VRAT_KATHAS["sankashti"];
  if (id.startsWith("purnima")) return VRAT_KATHAS["purnima"];
  return undefined;
}
