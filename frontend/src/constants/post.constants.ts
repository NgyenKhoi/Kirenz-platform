import { ReactionType } from "../types/reaction.types";

export const fallbackAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDn9I6Bn8A1s6Gv_kblRDw5crnta6Vb7W0KyrBjRdHoUu3nEM5p1A7ODn_isaa7M80w2yF_GqrvezNIIz11PYt7KqMNO5ISVUrgUKCJZ3FvNZkhQeNhkwYyW_jdHb2Qja9CR9u9BVzj_6IFkVhiHPLeS6JXKmIBmfaC71-cnJodIWg_zqMW4RUF73sKvLv8IZWTXErCay6A4e6Xaho8Q6Y-8TCyc4_rZbQGrTBGVqYllUj1ftVmkK9I2EnSe5Ph9NHEg-y1kcqoQHI";

export const reactionOptions: Array<{
  type: ReactionType;
  label: string;
  icon: string;
}> = [
  { type: "LIKE", label: "Like", icon: "\u{1F44D}" },
  { type: "LOVE", label: "Love", icon: "\u{2764}\u{FE0F}" },
  { type: "HAHA", label: "Haha", icon: "\u{1F606}" },
  { type: "WOW", label: "Wow", icon: "\u{1F62E}" },
  { type: "SAD", label: "Sad", icon: "\u{1F622}" },
  { type: "ANGRY", label: "Angry", icon: "\u{1F621}" },
];
