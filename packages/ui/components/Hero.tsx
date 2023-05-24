import {
  Button,
  Flex,
  Heading,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { User } from "../types";
import SignInButton from "./SignInButton";

type HeroProps = {
    title?: string,
    subtitle?: string,
    currentUser?: User,
    router?: any,
}
  
export default function Hero({
  title="Bulksale maker(仮)",
  subtitle="A Great tool for starting your own token sale",
  currentUser,
  router,
  ...rest
}: HeroProps) {
  return (
    <Flex
      align="center"
      justify={{ base: "center", md: "center", xl: "center" }}
      direction={{ base: "column-reverse", md: "row" }}
      wrap="nowrap"
      minH="50vh"
      px={{base: 2, md: 8}}
      mb={16}
      bg={'gray.700'}
      {...rest}
    >
      <Stack
        spacing={{ base: 4, lg: 8 }}
        w={{ base: "100%", md: "40%" }}
        align={'center'}
      >
        <Heading
          as="h1"
          size={{base: 'lg', md: 'xl'}}
          fontWeight="bold"
          color="primary.800"
          textAlign={'center'}
          whiteSpace='pre-line'
          lineHeight={{ base: 1.25, md: 1.4 }}
        >
          {title}
        </Heading>
        <Heading
          as="h2"
          size="md"
          color="primary.800"
          opacity="0.8"
          fontWeight="normal"
          lineHeight={1.5}
          textAlign={'center'}
        >
          {subtitle}
        </Heading>
        <HStack spacing={4}>
            {
                !currentUser && <SignInButton
                size={'lg'}
                onSuccess={(args: any) => { }}
                onError={(args: any) => {
                    if ('error' in args) {
                        const error = args.error;
                    }
                }}
                />
            }
            <Button size={'lg'} onClick={() => router.push('/sales')}>Browse Sales</Button>
        </HStack>
      </Stack>
    </Flex>
  )
}