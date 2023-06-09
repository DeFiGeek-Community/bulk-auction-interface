import { ethers } from "ethers";
import FactoryABI from "lib/constants/abis/Factory.json";
import SaleTemplateV1ABI from "lib/constants/abis/SaleTemplateV1.json";
import MintableERC20 from 'lib/constants/abis/MintableERC20.json';
import { SALE_TEMPLATE_V1_NAME } from "lib/constants";
import Big, { getBigNumber, multiply } from 'lib/utils/bignumber';
import { getDecimalsForView, tokenAmountFormat } from 'lib/utils';
import { differenceInSeconds, addSeconds, format } from 'date-fns';

const TOKEN_AMOUNT = 10;

Cypress.Commands.add('mintToken', () => {
  const token = getToken();

  return new Cypress.Promise(resolve => {
    token.decimals().then(decimals => token.mint(multiply(Big(TOKEN_AMOUNT), Big(10).pow(decimals)).toString()).then(res => resolve(res)))
  });
});

Cypress.Commands.add('revokeApproval', () => {
  const token = getToken();

  return new Cypress.Promise(resolve => {
    token.approve(Cypress.env('FACTORY_ADDRESS'), 0).then(res => resolve(res))
  });
});

function getToken() {
  const provider = ethers.getDefaultProvider(Cypress.env('NETWORK_NAME'));
  const account = new ethers.Wallet(Cypress.env('PRIVATE_KEY'), provider)
  const contract = new ethers.Contract(Cypress.env('TEST_TOKEN'), MintableERC20, account);
  return contract
}

function getFactoryContract() {
  const provider = ethers.getDefaultProvider(Cypress.env('NETWORK_NAME'));
  const account = new ethers.Wallet(Cypress.env('PRIVATE_KEY'), provider)
  const contract = new ethers.Contract(Cypress.env('FACTORY_ADDRESS'), FactoryABI, account);
  return contract
}

function getSaleContract(address) {
  const provider = ethers.getDefaultProvider(Cypress.env('NETWORK_NAME'));
  const contract = new ethers.Contract(address, SaleTemplateV1ABI, provider);
  return contract
}

describe('create-sale-spec', () => {
  before(() => {
    cy.revokeApproval()
    cy.mintToken()
    cy.setupMetamask(Cypress.env('PRIVATE_KEY'), Cypress.env('NETWORK_NAME'), Math.random().toString(32).substring(2))
    cy.visit('/');
  });

  after(() => {
    cy.revokeApproval()
  });

  it('should sign in with Ethereum', () => {
    cy.get('#sign-in-with-ethereum').click()
    cy.get('#metaMask').click()
    cy.acceptMetamaskAccess({ confirmSignatureRequest: true }).then( connected =>
      cy.get('.chakra-container > h2.chakra-heading').should(
        'have.text',
        'Dashboard',
      )
    )
  })

  it('should approve token usage', () => {
    cy.get('button').contains('Create new sale').first().click();
    cy.get('input#token').type(Cypress.env('TEST_TOKEN'))
    
    cy.get('input[name="allocatedAmount"]').clear().type(TOKEN_AMOUNT)
    cy.get('input[name="minRaisedAmount"]').clear().type(1)

    cy.get('button').contains('Approve token').first().click().then(res => {
      // workaround https://github.com/Synthetixio/synpress/issues/795
      cy.wait(10000)

      cy.confirmMetamaskPermissionToSpend(TOKEN_AMOUNT).then(spend => {
        cy.contains('Transaction sent!')
        cy.contains('Approval confirmed!', {timeout: 60000})
      })
    })
    
    cy.wait(1000)
  })

  it('should display identical information on confirmation screen that the user inputs', () => {
    cy.get('input.rs-picker-toggle-textbox').click()
    const options = { year: 'numeric', month: 'short' }
    // 1 day from now
    const start = new Date(new Date().getTime() + 60*60*24*1000)
    // 15 days from now
    const end = new Date(new Date().getTime() + 60*60*24*15*1000)
    const startString = `${start.getDate().toString().padStart(2, "0")} ${start.toLocaleDateString('en-GB', options)}`
    const endString = `${end.getDate().toString().padStart(2, "0")} ${end.toLocaleDateString('en-GB', options)}`
    cy.get(`[aria-label="${startString}"]`).first().click()
    cy.get(`[aria-label="${endString}"]`).first().click()

    // const timeButton1 = cy.get('div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs')
    cy.get('div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs').click()
    cy.get(`div[index="0"] [data-key="hours-5"]`).click()
    cy.get(`div[index="0"] [data-key="minutes-10"]`).click()
    cy.get(`div[index="0"] [data-key="seconds-0"]`).click()
    cy.get('div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs').click()
    // cy.wait(1000)
    // const timeButton2 = cy.get('div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs')
    cy.get('div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs').click()
    cy.get(`div[index="1"] [data-key="hours-15"]`).click()
    cy.get(`div[index="1"] [data-key="minutes-43"]`).click()
    cy.get(`div[index="1"] [data-key="seconds-0"]`).click()
    cy.get('div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs').click()
    
    cy.get('.rs-picker-toolbar-right > button').contains('OK').first().click()

    cy.get('button').contains('Deploy Sale Contract').first().click().then(() => {
      const token = getToken()
      Promise.all([token.totalSupply(), token.decimals(), token.symbol()]).then(([totalSupply, decimals, symbol]) => {
        const tokenAmountWithFormat = tokenAmountFormat(multiply(Big(TOKEN_AMOUNT), Big(10).pow(decimals)), decimals, getDecimalsForView(getBigNumber(totalSupply.toString()), decimals))
        cy.get('p[aria-label="Allocated to the sale"]').should('have.text', `${tokenAmountWithFormat} ${symbol}`).then(() => {
          cy.get('p[aria-label="Sale Template"]').should('have.text', 'SaleTemplateV1');
          cy.get('p[aria-label="Token address"]').should('have.text', Cypress.env('TEST_TOKEN'));
          cy.get('p[aria-label="Start date - End date"]').should('have.text', `${format(start, 'yyyy/MM/dd ')}05:10:00 - ${format(end, 'yyyy/MM/dd ')}15:43:00${' '}${format(new Date, '(z)')}`);
          cy.get('p[aria-label="Minimum total raised"]').should('have.text', '1.00 ETH');
        })
      })
    })
    cy.wait(5000)
  })

  it('should deploy sale contract with the same parameters as user\'s input', () => {
    cy.get('button[type="submit"]').contains('Deploy Sale Contract').first().click().then(res => {
      // workaround https://github.com/Synthetixio/synpress/issues/795
      cy.wait(10000)

      cy.confirmMetamaskTransaction().then(res => {
        cy.contains('Transaction sent!')
        cy.contains('Transaction confirmed!', {timeout: 60000})
      })
    })
    // cy.get('input#id').invoke('val')
    // .then((contractAddress) => {
    //   const sale = getSaleContract(address);
    // })
  })
})