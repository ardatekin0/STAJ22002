package com.project.auth_app.config;

import com.project.auth_app.model.BlacklistedToken;
import com.project.auth_app.model.ProductDiscount;
import com.project.auth_app.model.ProductTariff;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.BlacklistedTokenService;
import com.project.auth_app.service.ProductDiscountService;
import com.project.auth_app.service.ProductTariffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Slf4j
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "scheduler" ,name = "enable",havingValue = "true")
public class ScheduleConfig {

    private final BlacklistedTokenService blacklistedTokenService;
    private final ProductTariffService  productTariffService;
    private final ProductDiscountService productDiscountService;

    public ScheduleConfig(BlacklistedTokenService blacklistedTokenService,  ProductTariffService productTariffService, ProductDiscountService productDiscountService) {
        this.blacklistedTokenService = blacklistedTokenService;
        this.productTariffService = productTariffService;
        this.productDiscountService = productDiscountService;
    }


    @Scheduled(fixedRateString = "${scheduler.fixed-rate}")
    public void scheduledClearBlacklist() {

       List<BlacklistedToken> tokenList = blacklistedTokenService.findByExpirationDateBefore(new Date());
        log.info("Toplam {} tane expirationDate tarihi geçmiş token bulundu.", tokenList.size());

        for (BlacklistedToken token : tokenList) {
            blacklistedTokenService.deleteToken(token.getToken());
        }

        log.info("Toplam {} tane expirationDate tarihi geçmiş token silindi.", tokenList.size());
    }

    @Scheduled(fixedRateString = "${scheduler.fixed-rate-status}")
    public void scheduleSetStatus(){

        List<ProductTariff> productTariffs = productTariffService.getProductTariffsByStatusAndEndDate( StatusEnum.ACTIVE, LocalDateTime.now());
        List<ProductDiscount> productDiscounts  = productDiscountService.getProductDiscountByStatusAndEndDate(StatusEnum.ACTIVE, LocalDateTime.now());

        for (ProductTariff productTariff : productTariffs) {
            productTariffService.setStatusPassive(productTariff.getProductTariffId());
        }

        for (ProductDiscount productDiscount : productDiscounts) {
                productDiscountService.setStatusPassive(productDiscount.getProductDiscountId());
        }

        log.info("Toplam {} tane endDate tarihi geçmiş productTariffin statusu değiştirildi. ", productTariffs.size());
        log.info("Toplam {} tane endDate tarihi geçmiş productDiscountun statusu değiştirildi. ", productDiscounts.size());
    }
}


/*
    @ConditionalOnProperty(prefix = "scheduler" ,name = "enable",havingValue = "true")
    @Scheduled(fixedRateString = "${scheduler.fixed-rate}")
    public void scheduledClearBlacklist() {
        List<BlacklistedToken> tokenList = blacklistedTokenService.getBlacklistedTokens();
        if (tokenList != null) {

            int sayac = 0;

            tokenList.sort(Comparator.comparing(BlacklistedToken::getExpirationDate));

            for (BlacklistedToken token : tokenList) {

                int result = token.getExpirationDate().compareTo(new Date());
                if(result == -1) {
                    blacklistedTokenService.deleteToken(token.getToken());
                    sayac++;
                }
                else {
                    break;
                }
            }

            log.info("Toplam " + sayac + " tane expirationDate tarihi geçmiş token silindi.");
        }
    }
*/

