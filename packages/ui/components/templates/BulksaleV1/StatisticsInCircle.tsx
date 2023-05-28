import { chakra, Link, Heading, BoxProps, useToken, Tooltip } from "@chakra-ui/react";
import { Circle } from 'rc-progress';
import Big from '../../../utils/bignumber';
import { getTargetPercetage, getFiatConversionAmount, tokenAmountFormat, getEtherscanLink } from "../../../utils";
import { CHAIN_NAMES } from '../../../constants';
import { TriangleUpIcon } from "@chakra-ui/icons";

type Props = {
  totalProvided: Big;
  minimalProvideAmount: Big;
  interimGoalAmount: Big;
  finalGoalAmount: Big;
  providedTokenSymbol: string;
  providedTokenDecimal: number;
  fiatSymbol: string;
  fiatRate: number;
  contractAddress: string;
  started: boolean;
};

export default function StatisticsInCircle({
  totalProvided,
  minimalProvideAmount,
  interimGoalAmount,
  finalGoalAmount,
  providedTokenSymbol,
  providedTokenDecimal,
  fiatSymbol,
  fiatRate,
  contractAddress,
  started,
  ...boxProps
}: Props & BoxProps) {
  const chain = CHAIN_NAMES[process.env.NEXT_PUBLIC_CHAIN_ID as string];

  const [gray600, green400] = useToken('colors', ['gray.600', 'green.400']);

  const progressPercent = getTargetPercetage(totalProvided, finalGoalAmount);
  const minimumPercent = getTargetPercetage(minimalProvideAmount, finalGoalAmount);
  const interimGoalPercent = getTargetPercetage(interimGoalAmount, finalGoalAmount);

  return (
    <chakra.div {...boxProps}>
      <chakra.div position={'relative'}>
        <Tooltip hasArrow label={<chakra.p textAlign={'center'} p={1}>
          Minimum: {tokenAmountFormat(minimalProvideAmount, 18, 2)}ETH
          { totalProvided.gte(minimalProvideAmount) && <><br /> Achieved 🎉</>}
        </chakra.p>}>
          <TriangleUpIcon 
            position={'absolute'}
            zIndex={100}
            transform={`rotate(${minimumPercent * 360/100}deg)`}
            left={`calc(${(Math.sin((minimumPercent/100)*(2*Math.PI))+1) * 100/2}% - 8px - ${Math.sin((minimumPercent/100)*(2*Math.PI)) * 5.1}%)`}
            bottom={`calc(${(Math.cos((minimumPercent/100)*(2*Math.PI))+1) * 100/2}% - 8px - ${Math.cos((minimumPercent/100)*(2*Math.PI)) * 5.1}%)`}
          />
        </Tooltip>
        <Tooltip hasArrow label={<chakra.p textAlign={'center'} p={1}>
            Minimum Target: {tokenAmountFormat(interimGoalAmount, 18, 2)}ETH
            { totalProvided.gte(interimGoalAmount) && <><br /> Achieved 🎉</>}
          </chakra.p>}>
          <TriangleUpIcon 
            position={'absolute'}
            zIndex={100}
            transform={`rotate(${interimGoalPercent * 360/100}deg)`}
            left={`calc(${(Math.sin((interimGoalPercent/100)*(2*Math.PI))+1) * 100/2}% - 8px - ${Math.sin((interimGoalPercent/100)*(2*Math.PI)) * 5.1}%)`}
            bottom={`calc(${(Math.cos((interimGoalPercent/100)*(2*Math.PI))+1) * 100/2}% - 8px - ${Math.cos((interimGoalPercent/100)*(2*Math.PI)) * 5.1}%)`}
          />
        </Tooltip>
        <Link href={getEtherscanLink(chain, contractAddress, 'address')} target={'_blank'}>
          <Circle
            percent={progressPercent}
            // percent={[getTargetPercetage(totalProvided, finalGoalAmount) / 3, getTargetPercetage(totalProvided, finalGoalAmount) / 3, getTargetPercetage(totalProvided, finalGoalAmount) / 3]}
            strokeWidth={4}
            trailWidth={4}
            // strokeLinecap="square"
            strokeColor={green400}
            trailColor={gray600}
          />
          <chakra.div textAlign={'center'} position={'absolute'} margin={'auto'} top={0} bottom={0} left={0} right={0} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
            <Heading as={'h3'} fontSize={'lg'}>
              Total Provided
            </Heading>
            <chakra.div>
              <>
                <chakra.span fontSize={'2xl'}>{started ? tokenAmountFormat(totalProvided, providedTokenDecimal, 2) : '????'}{' '}</chakra.span>
                {providedTokenSymbol.toUpperCase()}
              </>
            </chakra.div>
            <span>
              {
                // TODO Fiat symbol ($, ¥)
                '$'
              }
              {started
                ? '' +
                  getFiatConversionAmount(Number(tokenAmountFormat(totalProvided, providedTokenDecimal, 2)), fiatRate).toFixed(2)
                : '????'}
            </span>
            <div>
              {!!interimGoalAmount && 
                <chakra.div textAlign={'center'}>
                  Minimum Target {tokenAmountFormat(interimGoalAmount, 18, 2)}
                  {providedTokenSymbol.toUpperCase()}
                  { 
                    totalProvided.gte(interimGoalAmount) && started && 
                    <chakra.span textAlign={'center'}> 🎉</chakra.span>
                  }
                </chakra.div>
              }
              {/* {
              !!finalGoalAmount && 
                <chakra.div textAlign={'center'}>
                  FINAL GOAL {tokenAmountFormat(finalGoalAmount, 18, 2)}
                  {providedTokenSymbol.toUpperCase()}
                  { 
                    totalProvided.gte(finalGoalAmount) && started && 
                    <chakra.span textAlign={'center'}> 🎉</chakra.span>
                  }
                </chakra.div>
              } */}
            </div>
          </chakra.div>
        </Link>
      </chakra.div>
    </chakra.div>
  );
}
