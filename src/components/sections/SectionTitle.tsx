import { Heading } from "@chakra-ui/react";
import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  dataAnimate?: boolean;
  mb?: string | number | { base?: string | number; md?: string | number };
};

export function SectionTitle({ children, dataAnimate = true, mb = 8 }: SectionTitleProps) {
  return (
    <Heading
      fontFamily="heading"
      fontWeight="400"
      letterSpacing="0.03em"
      lineHeight={0.9}
      fontSize={{ base: "3rem", md: "5.8rem" }}
      mb={mb}
      data-animate={dataAnimate ? true : undefined}
    >
      {children}
    </Heading>
  );
}
