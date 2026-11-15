package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.Assinatura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssinaturaRepository extends JpaRepository<Assinatura, Long> {

    Optional<Assinatura> findFirstByClienteIdAndStatusOrderByDataInicioDesc(
        Long clienteId,
        String status
    );

    List<Assinatura> findByClienteIdOrderByDataInicioDesc(Long clienteId);
}