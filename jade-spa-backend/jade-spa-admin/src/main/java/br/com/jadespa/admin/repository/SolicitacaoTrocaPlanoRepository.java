package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.SolicitacaoTrocaPlano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitacaoTrocaPlanoRepository
        extends JpaRepository<SolicitacaoTrocaPlano, Long> {

    List<SolicitacaoTrocaPlano> findByStatusOrderByDataSolicitacaoDesc(
        String status
    );

    List<SolicitacaoTrocaPlano> findByClienteIdOrderByDataSolicitacaoDesc(
        Long clienteId
    );

    boolean existsByClienteIdAndStatus(
        Long clienteId,
        String status
    );
}