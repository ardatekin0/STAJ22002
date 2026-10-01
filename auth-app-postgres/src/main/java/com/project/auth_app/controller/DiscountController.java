package com.project.auth_app.controller;

import com.project.auth_app.annotation.AuditLogAnnotation;
import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Discount;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.service.DiscountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.auth_app.model.ActionEnum.*;

@Slf4j
@RestController
@RequestMapping("/api/discount")
public class DiscountController {

    private final DiscountService discountService;

    public  DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }


    @AuditLogAnnotation(action = CREATE_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PostMapping("/create")
    public ResponseEntity<?> createDiscount(@RequestBody Discount discount) {

        try {
            discountService.createDiscount(discount);
            log.info("Discount oluşturuldu.");

            return ResponseEntity.ok("Discount oluşturuldu.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount oluşturulurken hata oluştu! " + e.getMessage());
        }
    }


    @AuditLogAnnotation(action = UPDATE_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @PutMapping("/update/{discountId}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long discountId, @RequestBody Discount discount) {

        try {
            discountService.updateDiscount(discountId, discount);
            log.info("Discount güncellendi.");

            return ResponseEntity.ok("Discount güncellendi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount güncellenirken hata oluştu! "  + e.getMessage());
        }
    }


    @AuditLogAnnotation(action = GET_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/{discountId}")
    public ResponseEntity<?> getDiscountById(@PathVariable Long discountId) {

        try{
            Discount discount = discountService.getDiscountById(discountId);
            return ResponseEntity.ok(discount);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount getirilirken hata oluştu! "  + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllDiscounts( @RequestParam(defaultValue = "discountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Discount> discounts = discountService.getAllDiscounts(sortBy, sortDirection);
            return ResponseEntity.ok(discounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount getirilirken hata oluştu! "   + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getDiscountsByStatus(@PathVariable StatusEnum status) {

        try {
            List<Discount> discounts = discountService.getDiscountsByStatus(status);
            return ResponseEntity.ok(discounts);
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount getirilirken hata oluştu! "   + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = DELETE_DISCOUNT,entityType = "discount")
    @PreAuthorize("hasAuthority('ROLE_TELEKOM')")
    @DeleteMapping("/{discountId}")
    public ResponseEntity<?> deleteDiscount(@PathVariable Long discountId) {

        try {
            discountService.deleteDiscount(discountId);
            log.info("Discount silindi.");

            return ResponseEntity.ok("Discount silindi.");
        }
        catch (Exception e){
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount silinirken hata oluştu! "   + e.getMessage());
        }
    }

    @AuditLogAnnotation(action = GET_DISCOUNT, entityType = "discount")
    @PreAuthorize("hasAnyAuthority('ROLE_TELEKOM', 'ROLE_CALL_CENTER')")
    @GetMapping("/search")
    public ResponseEntity<?> searchDiscounts(@RequestParam String search,@RequestParam(defaultValue = "discountId") String sortBy, @RequestParam(defaultValue = "asc") String sortDirection) {

        try {
            List<Discount> discounts = discountService.searchDiscounts(search, sortBy, sortDirection);
            return ResponseEntity.ok(discounts);
        }
        catch (Exception e) {
            throw new GenericException(HttpStatus.BAD_REQUEST, "İndirim aranırken hata oluştu! " + e.getMessage());
        }
    }
}
