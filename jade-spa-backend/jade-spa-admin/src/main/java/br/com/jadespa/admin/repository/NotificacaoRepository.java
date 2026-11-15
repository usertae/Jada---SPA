package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacaoRepository
        extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findAllByClienteEmailIgnoreCaseOrderByCriadaEmDesc(
        String clienteEmail
    );
}
