// ============================================================
//  БАГИЙН ЗУРГУУД & ТООН МЭДЭЭЛЭЛ
// ============================================================

export type Photo = {
  src: string;
  caption: string;
};

export const photos: Photo[] = [
  { src: "/images/team/6.jpg", caption: "МТАА — нэгдсэн хамт олон" },
  { src: "/images/team/1.jpg", caption: "Албаны хамт олон" },
  { src: "/images/team/2.jpg", caption: "Хээрийн ажлын өдрүүд" },
  { src: "/images/team/5.jpg", caption: "МТ, Автоматжуулалтын нэгж" },
  { src: "/images/team/4.jpg", caption: "Хамтдаа урагшаа" },
  { src: "/images/team/7.jpg", caption: "Албаны эмэгтэйчүүд" },
  { src: "/images/team/3.jpg", caption: "Нэг багийн хэмнэл" },
];

export const stats: { value: string; label: string }[] = [
  { value: "20", label: "жилийн замнал" },
  { value: "53", label: "мэргэшсэн хамт олон" },
  { value: "200+", label: "цэг салбарын автоматжуулалт" },
  { value: "98%", label: "амжилтын түвшин" },
];
