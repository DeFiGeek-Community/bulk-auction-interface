import { 
    chakra,
    Button,
    Flex, 
    Tooltip, 
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper
} from '@chakra-ui/react';
import { QuestionIcon } from '@chakra-ui/icons';
import { CustomProvider, DateRangePicker } from 'rsuite';
import { FormikProps } from 'formik';
import { differenceInSeconds, addSeconds } from 'date-fns';
import { Sale } from '../../../types/BulksaleV1';

export default function BulksaleV1Form({formikProps, address, approvals, writeFn, tokenData}: {formikProps: FormikProps<Sale>, address: `0x${string}`, approvals: any, writeFn: any, tokenData: any}) {
    return (
        <div>
            <form onSubmit={formikProps.handleSubmit}>
                <FormControl isInvalid={!!formikProps.errors.token && !!formikProps.touched.token}>
                    <FormLabel htmlFor='token' alignItems={'baseline'}>Token address
                        <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                    </FormLabel>
                    <Input id="token" name="token" onBlur={formikProps.handleBlur} onChange={(event: React.ChangeEvent<any>) => {
                        formikProps.handleChange(event);
                        // TODO Check if token exists and approved
                    }} value={formikProps.values.token ? formikProps.values.token : ''} placeholder='e.g.) 0x0123456789012345678901234567890123456789' />
                    <FormErrorMessage>{formikProps.errors.token}</FormErrorMessage>
                </FormControl>
    
                <FormControl mt={4} isInvalid={!!formikProps.errors.startingAt && !!formikProps.touched.startingAt}>
                    <FormLabel alignItems={'baseline'}>Start date - End date
                        <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                    </FormLabel>
                    <DateRangePicker
                        // className={colorMode === 'light' ? 'rs-theme-high-contrast' : 'rs-theme-dark'}
                        onBlur={(value: any) => {
                            // TODO
                            console.log(value)
                        }}
                        onChange={(value: any) => {
                            if(value === null) {
                                formikProps.setFieldValue('startingAt', now + 60 * 60 * 24 * 7);
                                formikProps.setFieldValue('eventDuration', 60 * 60 * 24 * 7);
                            } else {
                                const start = value[0];
                                const end = value[1];
                                const duration = differenceInSeconds(end, start);
                                formikProps.setFieldValue('startingAt', start.getTime());
                                formikProps.setFieldValue('eventDuration', duration);
                            }
                        }}
                        value={
                            [
                                new Date(formikProps.values.startingAt), 
                                addSeconds(new Date(formikProps.values.startingAt), formikProps.values.eventDuration)
                            ]}
                        format="yyyy-MM-dd HH:mm:ss"
                        defaultCalendarValue={[new Date('2022-02-01 00:00:00'), new Date('2022-05-01 23:59:59')]}
                    />
                    <FormErrorMessage>{formikProps.errors.startingAt}</FormErrorMessage>
                </FormControl>

                <FormControl mt={4} isInvalid={!!formikProps.errors.lockDuration && !!formikProps.touched.lockDuration}>
                    <FormLabel alignItems={'baseline'}>Lock duration
                        <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                    </FormLabel>
                    <Flex alignItems={'center'}>
                        <NumberInput flex="1" name="lockDuration" value={formikProps.values.lockDuration / (60*60*24)} min={1} max={90} onBlur={formikProps.handleBlur} onChange={(_: string, val: number) =>
                            formikProps.setFieldValue('lockDuration', val*60*60*24)
                        }>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <chakra.div px={2}>Days</chakra.div>
                    </Flex>
                    <FormErrorMessage>{formikProps.errors.lockDuration}</FormErrorMessage>
                </FormControl>

                <FormControl mt={4} isInvalid={!!formikProps.errors.expirationDuration && !!formikProps.touched.expirationDuration}>
                    <FormLabel alignItems={'baseline'}>Expiration duration
                        <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                    </FormLabel>
                    <Flex alignItems={'center'}>
                        <NumberInput flex="1" name="expirationDuration" value={formikProps.values.expirationDuration / (60*60*24)} min={30} max={365} onBlur={formikProps.handleBlur} onChange={(_: string, val: number) =>
                            formikProps.setFieldValue('expirationDuration', val*60*60*24)
                        }>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <chakra.div px={2}>Days</chakra.div>
                    </Flex>
                    <FormErrorMessage>{formikProps.errors.expirationDuration}</FormErrorMessage>
                </FormControl>

                <FormControl mt={4} isInvalid={!!formikProps.errors.totalDistributeAmount && !!formikProps.touched.totalDistributeAmount}>
                    <Flex justifyContent={'space-between'}>
                        <FormLabel alignItems={'baseline'}>Total distribute amount
                            <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                        </FormLabel>
                        <chakra.p>(Your balance: xxx{} {tokenData.symbol})</chakra.p>
                    </Flex>
                    
                    <Flex alignItems={'center'}>
                        <NumberInput flex="1" name="totalDistributeAmount" value={formikProps.values.totalDistributeAmount} precision={2} min={0.01} step={0.01} max={Number.MAX_SAFE_INTEGER} onBlur={formikProps.handleBlur} onChange={(strVal: string, val: number) =>
                            formikProps.setFieldValue('totalDistributeAmount', strVal ? strVal : 0)
                        }>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <chakra.div px={2} minW={'3rem'}>{tokenData.symbol}</chakra.div>
                    </Flex>
                    <FormErrorMessage>{formikProps.errors.totalDistributeAmount}</FormErrorMessage>
                </FormControl>

                <FormControl mt={4} isInvalid={!!formikProps.errors.minimalProvideAmount && !!formikProps.touched.minimalProvideAmount}>
                    <FormLabel alignItems={'baseline'}>Minimum provide amount
                        <Tooltip hasArrow label={'TODO explanation'}><QuestionIcon mb={1} ml={1} /></Tooltip>
                    </FormLabel>
                    <Flex alignItems={'center'}>
                        <NumberInput flex="1" name="minimalProvideAmount" value={formikProps.values.minimalProvideAmount} step={0.01} precision={2} min={0} max={10000000} onBlur={formikProps.handleBlur} onChange={(strVal: string, val: number) =>
                            // formikProps.setFieldValue('minimalProvideAmount', val)
                            formikProps.setFieldValue('minimalProvideAmount', strVal ? strVal : 0)
                        }>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <chakra.div px={2}>ETH</chakra.div>
                    </Flex>
                    <FormErrorMessage>{formikProps.errors.minimalProvideAmount}</FormErrorMessage>
                </FormControl>

                {
                    approvals.readFn.data && approvals.readFn.data.toString() !== '0' ?
                    <Button mt={8} 
                        type="submit" 
                        w={'full'} 
                        variant="solid" 
                        colorScheme='green'
                        isLoading={writeFn.isLoading}
                        isDisabled={!writeFn.writeAsync}
                    >
                        Deploy Sale Contract
                    </Button> :
                    <Button mt={8} 
                        w={'full'} 
                        variant="solid" 
                        colorScheme='blue'
                        onClick={approvals.writeFn.write}
                        isLoading={approvals.writeFn.isLoading}
                        isDisabled={!approvals.writeFn.write}
                    >
                        Approve token
                    </Button>
                }
                
            </form>
        </div>
    )
}