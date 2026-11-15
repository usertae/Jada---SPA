package br.com.jadespa.admin.repository;

import br.com.jadespa.admin.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
}