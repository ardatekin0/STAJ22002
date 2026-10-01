package com.project.auth_app.serviceImpl;

import com.project.auth_app.exception.GenericException;
import com.project.auth_app.model.Discount;
import com.project.auth_app.model.DiscountEnum;
import com.project.auth_app.model.ProductDiscount;
import com.project.auth_app.model.StatusEnum;
import com.project.auth_app.repository.DiscountRepository;
import com.project.auth_app.repository.ProductDiscountRepository;
import com.project.auth_app.service.DiscountService;
import com.project.auth_app.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;
    private final ProductDiscountRepository  productDiscountRepository;
    private final ValidationService  validationService;

    public  DiscountServiceImpl(DiscountRepository discountRepository, ValidationService validationService, ProductDiscountRepository productDiscountRepository) {
        this.discountRepository = discountRepository;
        this.validationService = validationService;
        this.productDiscountRepository = productDiscountRepository;
    }



    @Override
    public Discount createDiscount(Discount discount) {

        validationService.createDiscountValid(discount);

        if(discountRepository.findByDiscountName(discount.getDiscountName()).isPresent()) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Discount name zaten mevcut.");
        }

        Integer Code = discountRepository.findMaxDiscountCode().orElse(0) + 1;

        discount.setDiscountCode(Code);
        discount.setStatus(discount.getStatus() != null ? discount.getStatus() : StatusEnum.ACTIVE);
        discount.setUpdatedAt(LocalDateTime.now());

        return discountRepository.save(discount);
    }

    @Override
    public Discount updateDiscount(Long discountId, Discount discount) {

        Discount existingDiscount = discountRepository.findById(discountId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Discount id bulunamadı.Discount Id: " + discountId));

        validationService.updateDiscountValid(discount);

        boolean onlyStatusChanged =
                existingDiscount.getDiscountName().equals(discount.getDiscountName()) &&
                        existingDiscount.getDiscountType().equals(discount.getDiscountType()) &&
                        existingDiscount.getDiscountPrice().compareTo(discount.getDiscountPrice()) == 0 &&
                        existingDiscount.getValidityStartDate().equals(discount.getValidityStartDate()) &&
                        existingDiscount.getValidityEndDate().equals(discount.getValidityEndDate());

        if(onlyStatusChanged) {

            existingDiscount.setStatus(discount.getStatus() != null ? discount.getStatus() : StatusEnum.ACTIVE);
            existingDiscount.setUpdatedAt(LocalDateTime.now());
            return discountRepository.save(existingDiscount);
        }
        else{

            if (discount.getValidityStartDate().isBefore(existingDiscount.getValidityStartDate())) {
                throw new GenericException(HttpStatus.BAD_REQUEST,"Yeni indirim başlangıç tarihi, eski indirim başlangıç tarihinden önce olamaz.");
            }

            existingDiscount.setStatus(StatusEnum.PASSIVE);
            existingDiscount.setUpdatedAt(LocalDateTime.now());
            discountRepository.save(existingDiscount);

            Discount newDiscountVersion = new Discount();

            newDiscountVersion.setDiscountName(discount.getDiscountName());
            newDiscountVersion.setDiscountType(discount.getDiscountType());
            newDiscountVersion.setDiscountCode(existingDiscount.getDiscountCode());
            newDiscountVersion.setDiscountPrice(discount.getDiscountPrice());
            newDiscountVersion.setStatus(discount.getStatus());
            newDiscountVersion.setValidityStartDate(discount.getValidityStartDate());
            newDiscountVersion.setValidityEndDate(discount.getValidityEndDate());
            newDiscountVersion.setUpdatedAt(LocalDateTime.now());

            return discountRepository.save(newDiscountVersion);
        }
    }

    @Override
    public List<Discount> getAllDiscounts(String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "discountId",
                "discountName",
                "discountCode",
                "discountType",
                "discountPrice",
                "status",
                "validityStartDate",
                "validityEndDate",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "discountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return discountRepository.findAllSorted(sortBy, sortDirection);
    }

    @Override
    public Discount getDiscountById(Long discountId) {
        return discountRepository.findById(discountId).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Discount id bulunamadı.Discount Id: " + discountId));
    }

    @Override
    public List<Discount> getDiscountsByStatus(StatusEnum status) {
        return discountRepository.findByStatus(status);
    }

    @Override
    public List<Discount> getDiscountsByPrice(BigDecimal price) {
        return discountRepository.findByDiscountPrice(price);
    }

    @Override
    public List<Discount> getDiscountsByType(DiscountEnum discountType) {
        return discountRepository.findByDiscountType(discountType);
    }

    @Override
    public Discount getDiscountByCode(Integer discountCode) {
        return discountRepository.findByDiscountCode(discountCode).orElseThrow(()-> new GenericException(HttpStatus.NOT_FOUND,"Discount code bulunamadı.Discount Code: " + discountCode));
    }

    @Override
    public void deleteDiscount(Long discountId) {
        List<ProductDiscount> productDiscounts = productDiscountRepository.findByDiscount_DiscountId(discountId);

        if (!productDiscounts.isEmpty()) {
            throw new GenericException(HttpStatus.BAD_REQUEST,"Bu discount bir veya bir kaç productdiscount tarafından kullanılıyor o yüzden silinemez.");
        }
        discountRepository.deleteById(discountId);
    }

    @Override
    public List<Discount> searchDiscounts(String search, String sortBy, String sortDirection) {

        List<String> allowedSortFields = List.of(
                "discountId",
                "discountName",
                "discountCode",
                "discountType",
                "discountPrice",
                "status",
                "validityStartDate",
                "validityEndDate",
                "updatedAt"
        );

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "discountId";
        }

        if (!sortDirection.equalsIgnoreCase("asc")
                && !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
        return discountRepository.searchDiscounts(search, sortBy, sortDirection);
    }
}
